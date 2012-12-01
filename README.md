projoooce
=========

Connecting Juice Bar Patrons with Fruit Farmers


Installation
============

Acquire dependencies:

    pip install -r requirements.txt

Install redis:

    brew install redis
    cp /usr/local/Cellar/redis/2.6.4/homebrew.mxcl.redis.plist ~/Library/LaunchAgents/
    launchctl load -w ~/Library/LaunchAgents/homebrew.mxcl.redis.plist

Play with redis:

    redis-cli

Keep an eye on redis:

    redis-cli monitor
