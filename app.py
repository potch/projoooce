import functools
import json
import random
import sys

from flask import Flask, Response, request, render_template
from flask.views import MethodView

from common import redis
from pinscrape import get_pins

try:
    import settings_local as settings
except ImportError:
    import settings

app = Flask(__name__)


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
        # I would use `srandmember`, but I want to exclude myself.
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

    def get(self, user):
        if user:
            # Return a single user.
            return Response()
        else:
            # Return a list of users.
            return Response()

    def post(self):
        """Create a new user."""

        if not request.form.get('pass'):
            return Response(status_code=403)

        me = request.form.get('user', '').lower()
        if me and not redis.sismember('users', me):
            redis.sadd('users', me)

        return Response(user)

    def delete(self, user):
        """Delete a single user."""
        return Response()

    def put(self, user):
        """Update a single user."""
        return Response()


user_view = UserAPI.as_view('user_api')
app.add_url_rule('/users/', defaults={'user': None},
                 view_func=user_view, methods=['GET'])
app.add_url_rule('/users/', view_func=user_view, methods=['POST'])
app.add_url_rule('/users/<user>', view_func=user_view,
                 methods=['GET', 'PUT', 'DELETE'])


class HeyGirlILikeArtsyBakedGoodsTooAPI(MethodView):

    @jsonify
    def get(self, me):
        """Who's pinterested in me?"""
        if 'unread' in request.form:
            unread = list(redis.smembers('users:%s:match:unread' % me))
            redis.delete('users:%s:match:unread')
            return unread
        else:
            return list(redis.smembers('users:%s:match' % me))

    def post(self, girl):
        """Yes. I'm pinterested."""

        yes = request.form.get('yes', '').lower()
        me = request.form.get('me', '').lower()

        if not (yes or me):
            return Response(status_code=403)

        # Girl, I'm pinterested in you.
        key = 'users:%s:yes' % girl
        if yes:
            if not redis.sismember(key, me):
                redis.sadd(key, me)

            # Girl, are you pinterested in me?
            if redis.sismember('users:%s:yes' % me, girl):

                # Girl, I'm a match for you.
                key = 'users:%s:match' % girl
                if not redis.sismember(key, girl):
                    redis.sadd(key, me)
                key = 'users:%s:match:unread' % girl
                if not redis.sismember(key, girl):
                    redis.sadd(key, me)

                # Girl, you're a match for me.
                key = 'users:%s:match' % me
                if not redis.sismember(key, me):
                    redis.sadd(key, girl)
                key = 'users:%s:match:unread' % me
                if not redis.sismember(key, me):
                    redis.sadd(key, girl)

        return Response(json.dumps({'success': True}))


yes_view = HeyGirlILikeArtsyBakedGoodsTooAPI.as_view('yes_api')
app.add_url_rule('/heygirlilikeartsybakedgoodstoo/<me>',
                 view_func=yes_view, methods=['GET'])
app.add_url_rule('/heygirlilikeartsybakedgoodstoo/<girl>',
                 view_func=yes_view, methods=['POST'])


if __name__ == '__main__':
    kw = {'debug': True,
          'host': '0.0.0.0'}
    try:
        kw['port'] = int(sys.argv[1])
    except (IndexError, ValueError):
        pass
    app.run(**kw)
