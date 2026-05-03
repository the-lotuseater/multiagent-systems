import subprocess
import threading
import time
import urllib.request
import urllib.error
from dotenv import load_dotenv
from app.common.logger import get_logger
from app.common.custom_exception import CustomException


logger = get_logger(__name__)

load_dotenv()


def run_backend():
    logger.info('Starting backend server...')
    try:
        subprocess.run(['uvicorn', 'app.backend.app:app','--host','127.0.0.1','--port','8000'])

    except Exception as e:
        logger.error(f'Failed to start backend')
        raise CustomException('Failed to start backend', e)
    

def run_frontend():
    logger.info('starting frontend')
    try:
        subprocess.run(['npm.cmd', 'start'], cwd='app/frontend')
    except Exception as e:
        logger.error(f'Failed to start frontend')
        raise CustomException('Failed to start frontend', e)


def wait_for_backend(url, retries=20, delay=2):
    for _ in range(retries):
        try:
            urllib.request.urlopen(url)
            return True
        except urllib.error.URLError:
            time.sleep(delay)
    return False


if __name__ == "__main__":
    try:
        threading.Thread(target=run_backend, daemon=True).start()
        logger.info('Waiting for backend to be ready...')
        if wait_for_backend('http://localhost:8000/supported-models'):
            logger.info('Backend is ready, starting frontend...')
            threading.Thread(target=run_frontend, daemon=True).start()
        else:
            logger.error('Backend did not start in time')
    except Exception as e:
        raise CustomException('Failed to start application', e)