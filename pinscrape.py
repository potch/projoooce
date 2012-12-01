import json
import requests

from pyquery import PyQuery as pq


def get_pins(user):
    url = 'http://pinterest.com/%s/pins/' % user

    r = requests.get(url)

    doc = pq(r.content)

    pins = []

    for img in doc('.PinImageImg'):
        print pq(img).parent().html()
        src = pq(img).attr('src')
        if src not in pins:
            pins.append(src)

    return pins

