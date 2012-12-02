import os

import requests
from pyquery import PyQuery as pq

from common import redis


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
    pins = scrape_pins(user)
    for url in pins['pins']:
        redis.sadd('users:%s:pins' % user, url)
    return pins
