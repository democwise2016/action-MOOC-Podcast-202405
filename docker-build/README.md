# Dockerhub

- https://docs.docker.com/get-started/04_sharing_app/
- https://hub.docker.com/
- `docker image ls | head` 找出合適的名稱，例如「action-rss-ut-app」
- 建立合適的repo https://hub.docker.com/
- `docker tag action-rss-ut-app pudding/github-action-app:puppeteer-python-14-action-rss-ut-20230903-0240`
- `docker push pudding/github-action-app:puppeteer-python-14-action-rss-ut-20230903-0240`
- 修改docker-compose.yaml `image: pudding/github-action-app:puppeteer-python-14-action-rss-ut-20230903-0240`