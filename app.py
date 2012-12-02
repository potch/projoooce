import functools
import json
import random
import sys

from flask import Flask, Response, request, render_template
from flask.views import MethodView

from common import redis
from pinscrape import download_pins, get_pins

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
    user = None
    if shuffle:
        exclude = request.values.get('exclude')
        if exclude:
            users = redis.sdiff('users', 'users:%s:ugos' % exclude)
        else:
            users = redis.smembers('users')
        if users:
            users = list(users)
            random.shuffle(users)
            user = users[0]

    print user  # Nice to know.
    if user:
        pins = get_pins(user)
        pins['remaining'] = len(users)
        return pins
    else:
        return {}


def home():
    matches = [
        ('mwindebank', 'mwindebank-1347468925_600.jpg'),
        ('samanthakiser7', 'samanthakiser7-1353020567_600.jpg'),
        ('callmemonalisa', 'callmemonalisa_1344993669_600.jpg'),
        #'cassyjmorris', 'cassyjmorris-1346242050_600.jpg',
        #'juliettesierra', 'juliettesierra_1344218153_600.jpg',
        #'hollyrob92', 'hollyrob92-1353702856_600.jpg',
        #'tollilolly', 'tollilolly-52_600.jpg',
        #'melaniexeinalem', 'melaniexeinalem-87_600.jpg'
    ]
    return render_template('index.html', matches=matches)


@app.route('/')
def index():
    return home()


@app.route('/chat')
def chat():
    return home()


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
            redis.sadd('users:%s:ugos' % me, me)
            download_pins(me)

        return Response(me)

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
        if 'unread' in request.values:
            key = 'users:%s:match:unread' % me
            unread = list(redis.smembers(key))
            redis.delete(key)
            return unread
        else:
            return list(redis.smembers('users:%s:match' % me))

    def post(self, girl):
        """Yes. Girl, I'm pinterested in you."""

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

        # Girl, I'm over you.
        redis.sadd('users:%s:ugos' % me, girl)

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
