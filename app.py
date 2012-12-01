import functools
import json
import sys

from flask import Flask, Response, abort, request, render_template
from pinscrape import get_pins

try:
    import settings_local
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


@app.route('/pins/<user>')
@jsonify
def pins(user):
    return get_pins(user)


@app.route('/')
def index():
    return render_template('index.html')


if __name__ == '__main__':
    kw = {'debug': True}
    try:
        kw['port'] = int(sys.argv[1])
    except (IndexError, ValueError):
        pass
    app.run(**kw)
