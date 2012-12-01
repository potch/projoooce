import json
import requests

from pyquery import PyQuery as pq


def get_pins(user):
    url = 'http://pinterest.com/%s/pins/' % user

    r = requests.get(url)

    doc = pq(r.content)

    pins = []

    for img in doc('.PinImageImg'):
        pins.append(pq(img).attr('src'))

    return pins

