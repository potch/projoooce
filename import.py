from common import redis


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

redis.flushall()
for user in users:
    redis.sadd('users', user)
