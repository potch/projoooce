import functools
import json
import random
import sys

from flask import Flask, Response, abort, request, render_template
from flask.views import MethodView

from redis import Redis

from pinscrape import get_pins

try:
    import settings_local as settings
except ImportError:
    import settings


app = Flask(__name__)

redis = Redis(host=settings.REDIS_HOST,
              port=settings.REDIS_PORT,
              db=settings.REDIS_DB,
              password=settings.REDIS_PASS)


def jsonify(f):
    @functools.wraps(f)
    def wrapper(*args, **kw):
        response = f(*args, **kw)
        return Response(json.dumps(response),
                        headers={'Content-Type': 'application/json'})
    return wrapper


@app.route('/pins', defaults={'shuffle': True})
@app.route('/pins/<user>')
@jsonify
def pins(user=None, shuffle=False):
    user = 'kkoberger90'
    if shuffle:
        users = redis.smembers('users')
        if users:
            users = list(users)
            random.shuffle(users)
            for naughty_boy in request.values.get('exclude', '').split(','):
                if naughty_boy in users:
                    users.remove(naughty_boy)
            user = users[0]
    print user  # Nice to know.
    return get_pins(user)


@app.route('/')
def index():
    return render_template('index.html')


class UserAPI(MethodView):

    def get(self, user_id):
        if user_id:
            # Return a single user.
            return Response()
        else:
            # Return a list of users.
            return Response()

    def post(self):
        """Create a new user."""
        if not request.form.get('pass'):
            return Response(status_code=403)
        user = request.form.get('user')
        if user and not redis.sismember('users', user):
            redis.sadd('users', user)
        return Response(user)

    def delete(self, user_id):
        """Delete a single user."""
        return Response()

    def put(self, user_id):
        """Update a single user."""
        return Response()


user_view = UserAPI.as_view('user_api')
app.add_url_rule('/users/', defaults={'user_id': None},
                 view_func=user_view, methods=['GET'])
app.add_url_rule('/users/', view_func=user_view, methods=['POST'])
app.add_url_rule('/users/<int:user_id>', view_func=user_view,
                 methods=['GET', 'PUT', 'DELETE'])


if __name__ == '__main__':
    kw = {'debug': True,
          'host': '0.0.0.0'}
    try:
        kw['port'] = int(sys.argv[1])
    except (IndexError, ValueError):
        pass
    app.run(**kw)
