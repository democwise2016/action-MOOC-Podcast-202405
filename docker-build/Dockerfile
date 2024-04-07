#Specify the version of nodejs.
#FROM buildkite/puppeteer:10.0.0
#FROM dayyass/muse_as_service:1.1.2
# FROM apify/actor-node-puppeteer-chrome:18-20.4.0-beta

# RUN wget http://ftp.us.debian.org/debian/pool/main/y/youtube-dl/youtube-dl_2021.12.17-2_all.deb
# RUN apt-get install -y ./youtube-dl_2021.12.17-2_all.deb

FROM node:14.21.3-bullseye

# RUN cat /etc/apt/sources.list

# RUN sed -i s/deb.debian.org/archive.debian.org/g /etc/apt/sources.list
# RUN sed -i 's|security.debian.org|archive.debian.org/|g' /etc/apt/sources.list
# RUN sed -i '/stretch-updates/d' /etc/apt/sources.list
# # RUN ls /etc/apt/sources.list.d
# RUN rm -rf /etc/apt/sources.list.d/*
# COPY ./sources.list /etc/apt/
# RUN cat /etc/apt/sources.list

# RUN apt-get clean 
RUN apt update

RUN apt-get install ffmpeg -y

RUN apt install python3-pip -y
RUN pip3 install youtube-dl

# ==============================================

# CMD ["node", "/app/index.js"]
CMD ["bash", "/startup.sh"]

# RUN mkdir -p /node
# WORKDIR /node

RUN npm link puppeteer@20.4.0

RUN npm link iconv-lite@0.6.3

RUN npm link sequelize@6.7.0
RUN npm link sqlite3@5.0.2

RUN npm link papaparse@5.3.2

RUN npm link jquery@3.6.3

# RUN npm link node-gyp
# RUN node-gyp configure

RUN npm link jsdom@22.1.0

RUN npm link rss-parser@3.13.0
RUN npm link feed@4.2.2
RUN npm link @extractus/feed-extractor@6.2.2

# RUN npm link typescript 
# RUN npm link husky@7
# RUN npm link axios@1.4.0
# RUN apt-get install -y husky
# RUN npm i husky --save-dev -g
RUN npm link cheerio@1.0.0-rc.12

RUN npm link htmlentities@1.0.0

RUN npm link node-fetch@2

RUN npm install fluent-ffmpeg@2.1.2
RUN npm install progress-stream@2.0.0
RUN npm install sanitize-filename@1.6.3

RUN npm install tor-request@3.1.0
RUN npm install socks-proxy-agent@8.0.1
RUN npm install socks5-https-client@1.2.1
RUN npm install tree-kill@1.2.2

RUN apt install tor -y
# RUN npm config get proxy

RUN npm link moment@2.29.4
RUN npm link linkify-urls@3.1.1
RUN npm link follow-redirects@1.15.2
RUN npm link get-mp3-duration@1.0.0

RUN apt-get install -y chromium
#RUN apt-get install -y apt install libgconf-2-4 libatk1.0-0 libatk-bridge2.0-0 libgdk-pixbuf2.0-0 libgtk-3-0 libgbm-dev libnss3-dev libxss-dev

RUN npm link cache-manager@4.0.1
RUN npm link cache-manager-sqlite@0.2.0

# 這個會很常壞，所以要放到最後安裝
RUN npm link ytdl-core@4.11.4

# ----------------

# RUN npm -g puppeteer@20.4.0

# RUN npm -g iconv-lite@0.6.3

# RUN npm -g sequelize@6.7.0
# RUN npm -g sqlite3@5.0.2

# RUN npm -g papaparse@5.3.2

# RUN npm -g jquery@3.6.3

# RUN npm -g rss-parser@3.13.0
# RUN npm -g feed@4.2.2
# RUN npm -g @extractus/feed-extractor@6.2.2

# RUN npm -g cheerio@1.0.0-rc.12

# RUN npm -g htmlentities@1.0.0

RUN pip install pytube

# ========================

RUN apt-get install -y tor
# RUN tor --version