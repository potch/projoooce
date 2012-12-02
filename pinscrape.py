import os

import requests
from pyquery import PyQuery as pq

from common import redis


PINS_DIR = 'static/img/pins/'


def get_pins(user, force=False):
    pins = redis.smembers('users:%s:pins' % user)
    if force or not pins:
        print 'From pinterest ...'
        return download_pins(user)
    else:
        print 'From redis ...'
        return {'user': user, 'pins': list(pins)}


def scrape_pins(user):
    url = 'http://pinterest.com/%s/pins/' % user

    r = requests.get(url)

    doc = pq(r.content)

    pins = []

    for img in doc('.PinImageImg'):
        src = pq(img).attr('src')
        if src not in pins:
            pins.append(src)

    return {'user': user, 'pins': pins}


def download_pins(user):
    if not os.path.exists(PINS_DIR):
        os.makedirs(PINS_DIR)

    pins = scrape_pins(user)
    new_pins = dict(pins)
    new_pins['pins'] = []

    for url in pins['pins']:
        _, fn = url.rsplit('/', 1)

        print url
        r = requests.get(url)
        open(PINS_DIR + fn, 'w').write(r.content)

        redis.sadd('users:%s:pins' % user, fn)

        new_pins['pins'].append(fn)

    return new_pins
