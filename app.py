import json

from flask import Flask, Response, abort, request, render_template
from pinscrape import get_pins



app = Flask(__name__)


def jsonify(o):
    return Response(json.dumps(o), headers={
                    'Content-Type': 'application/json' })


@app.route("/pins/<user>")
def pins(user):
    return jsonify(get_pins(user))


if __name__ == "__main__":
    app.run(debug=True)