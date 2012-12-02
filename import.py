import random
import sys

from common import redis


if __name__ == '__main__':
    users = '''cassyjmorris
    j1l1b1
    melaniexeinalem
    juliettesierra
    samanthakiser7
    crisssy101
    hollyrob92
    tollilolly
    elisemckenna
    banebakken
    callmemonalisa
    mwindebank'''.split('\n')

    random.shuffle(users)

    try:
        users = users[:int(sys.argv[1])]
    except (IndexError, ValueError):
        pass

    redis.flushall()
    for user in users:
        redis.sadd('users', user.strip())
