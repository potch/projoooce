import functools
import json
import os
import random
import sys

from flask import Flask, Response, request, render_template
from flask.views import MethodView

from common import redis
from pinscrape import download_pins, get_pins

try:
    if os.environ.get('DEBUG'):
        import settings_local as settings
    else:
        import settings_prod as settings
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


@app.route('/pins')
@app.route('/pins/<user>')
@jsonify
def pins(user=None, limit=5):
    user = None
    users = set()

    me = request.values.get('me')
    if me:
        users = redis.sdiff('users', 'users:%s:ugos' % me)
    else:
        users = redis.smembers('users')

    if users:
        # Filter by location.
        zipshort = redis.get('users:%s:zipshort' % me)
        users = users & redis.smembers('zipshort:%s' % zipshort)

        # Filter by sex. Yes, please.

        # This person wants my sex.
        sex_am = redis.get('users:%s:sex_am' % me)
        users = users & redis.smembers('sex_want:%s' % sex_am)

        # I want this person's sex.
        sex_want = redis.get('users:%s:sex_want' % me)
        users = users & redis.smembers('sex_am:%s' % sex_want)

        # Filter by users within my age range (+/- 10 years).
        try:
            age = int(redis.get('users:%s:birthyear' % me))
        except ValueError:
            pass
        else:
            geezers = redis.zrangebyscore('birthyears', '-inf', age - 11)
            premies = redis.zrangebyscore('birthyears', age + 11, '+inf')
            users = users - set(geezers) - set(premies)

        if users:
            users = list(users)
            random.shuffle(users)
            users = users[:limit]

    data = []
    remaining = len(users)
    for user in users:
        pins = get_pins(user)
        pins['remaining'] = remaining
        remaining -= 1
        data.append(pins)
        print user  # Nice to know.
    return data


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

    @jsonify
    def get(self, user):
        def get_data(user):
            data = {}
            for field in ('sex_am', 'sex_want', 'zip', 'birthday'):
                data[field] = redis.get('users:%s:%s' % (user, field))
            return data

        if user:
            # Return data for a single user.
            return get_data(user)
        else:
            # Return data for all users.
            data = {}
            for user in redis.smembers('users'):
                data[user] = get_data(user)
            return data

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

        redis.srem('users', user)

        sets = ['sex_am', 'sex_want', 'zip', 'zipshort', 'birthday', 'birthyear', 'pins']
        for key in sets:
            value = redis.get('users:%s:%s' % (user, key))
            if value is not None:
                redis.srem('%s:%s' % (key, value), user)

        keys = ['sex_am', 'sex_want', 'ugos', 'zip', 'zipshort', 'birthday', 'birthyears']
        for key in keys:
            redis.delete('users:%s:%s' % (user, key))

        redis.zrem('birthyears', user)

        return Response()

    def put(self, user):
        """Update a single user."""

        sex_am = request.form.get('sex_am')
        if sex_am in ('guy', 'gal'):
            previous = redis.get('users:%s:sex_am' % user)
            if previous and previous != sex_am:
                redis.srem('sex_am:%s' % previous, user)

            redis.set('users:%s:sex_am' % user, sex_am)
            redis.sadd('sex_am:%s' % sex_am, user)

        sex_want = request.form.get('sex_want')
        if sex_want in ('guy', 'gal'):
            previous = redis.get('users:%s:sex_want' % user)
            if previous and previous != sex_want:
                redis.srem('sex_want:%s' % previous, user)

            redis.set('users:%s:sex_want' % user, sex_want)
            redis.sadd('sex_want:%s' % sex_want, user)

        zipcode = request.form.get('zip', '')
        zipshort = zipcode[:2]

        previous = redis.get('users:%s:zip' % user)
        if previous and previous != zipcode:
            redis.srem('zip:%s' % previous, user)
        redis.set('users:%s:zip' % user, zipcode)

        previous = redis.get('users:%s:zipshort' % user)
        if previous and previous != zipshort:
            redis.srem('zipshort:%s' % previous, user)
        redis.set('users:%s:zipshort' % user, zipshort)

        redis.sadd('zip:%s' % zipcode, user)
        redis.sadd('zipshort:%s' % zipshort, user)

        birthday = request.form.get('birthday', '')
        birthyear = birthday.split('-')[0]

        previous = redis.get('users:%s:birthyear' % user)
        if previous and previous != birthyear:
            redis.srem('birthyears:%s' % previous, user)

        redis.set('users:%s:birthday' % user, birthday)
        redis.set('users:%s:birthyear' % user, birthyear)

        redis.sadd('users:%s:birthday' % birthday, user)
        redis.sadd('users:%s:birthyear' % birthyear, user)

        # Birthyear is the score.
        redis.zadd('birthyears', user, birthyear)

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
    debug = bool(os.environ.get('DEBUG'))
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=debug, host='0.0.0.0', port=port)
