import sys
sys.path.append('/home/dotcloud/current')

from app import app as application
application.config.update(DEBUG=True)
