import functools
import json

from flask import Flask, Response, abort, request, render_template
from pinscrape import get_pins


app = Flask(__name__)


def jsonify(f):
    @functools.wraps(f)
    def wrapper(*args, **kw):
        response = f(*args, **kw)
        print response
        return Response(json.dumps(response),
                        headers={'Content-Type': 'application/json' })
    return wrapper


@app.route("/pins/<user>")
@jsonify
def pins(user):
    return get_pins(user)


@app.route("/")
def index():
    return render_template("index.html")


if __name__ == "__main__":
    app.run(debug=True)