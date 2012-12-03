import os
import random
import sys

from common import redis
from pinscrape import download_pins


if __name__ == '__main__':
    users = ['cassyjmorris',
             'j1l1b1',
             'melaniexeinalem',
             'juliettesierra',
             'samanthakiser7',
             'crisssy101',
             'hollyrob92',
             'tollilolly',
             'elisemckenna',
             'banebakken',
             'callmemonalisa',
             'mwindebank',
             'cjdal16',
             'chrisem']

    random.shuffle(users)

    try:
        users = users[:int(sys.argv[1])]
    except (IndexError, ValueError):
        pass

    redis.flushall()
    for user in users:
        redis.sadd('users', user.strip())
        download_pins(user)
    print 'Imported %s users' % len(users)
