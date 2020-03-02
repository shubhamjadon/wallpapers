const request = require('request');
const cheerio = require('cheerio');
const wallpaper = require('wallpaper');
const mousetrap = require('mousetrap');
const { app } = require('electron').remote;
const path = require('path');
const uuid = require('uuid/v4');
const fs = require('fs');

let main = new Vue({
    el: '#main',
    data: {
        photos: [],
        link: '',
        result: true,
        applying: false,
        searching: false,
        canFetch: true,
        url: 'https://wallpaperscraft.com',
        width: '1920',
        height: '1080'
    },
    methods: {
        checkNetwork: function () {
            if (navigator.onLine) {
                return this.fetchPhotos();
            }
            setTimeout(() => {
                this.checkNetwork();
            }, 1000);
        },
        fetchPhotos: function () {
            let options = {
                url: `${this.url}${this.link}`,
                gzip: true
            }
            request(options, (err, res, body) => {
                if (err) return this.checkNetwork();
                let temp_photos = this.photos.slice();
                let $ = cheerio.load(body);
                let imgLinks = $('.wallpapers__canvas .wallpapers__image');
                this.link = $('.pager__item_selected').next().find('a').attr('href');
                this.result = true;
                for (let key in imgLinks) {
                    if (Number(key) < 15) {
                        temp_photos.push({
                            id: uuid(),
                            url: imgLinks[key].attribs.src
                        });
                    }
                }
                this.photos = temp_photos;
                this.canFetch = true;
                if (this.photos.length == 0) this.result = false;
            });
        },
        applyPhoto: function (imageUrl) {
            let filePath = path.join(app.getPath('pictures'), 'daily-wallpaper.jpg');
            imageUrl = imageUrl.replace('300x168', `${this.width}x${this.height}`);
            this.applying = true;
            if(navigator.onLine) {
                request(imageUrl)
                    .on('close', ()=>{
                        (async () => {
                            await wallpaper.set(filePath);
                            this.applying = false;
                        })();
                    })
                    .pipe(fs.createWriteStream(filePath));
            } else {
                this.applying = false;
            }
        },
        handleScroll: function() {
            let imgLoading = document.querySelector('.lds-ellipsis');
            let pos = imgLoading.getBoundingClientRect();
            if (window.innerHeight / pos.y >= 1 && this.canFetch) {
                this.canFetch = false;
                this.fetchPhotos();
            }
        },
        searchToggle: function() {
            this.searching = !this.searching;
            this.$nextTick(() => {
                this.$refs.input.focus()
            })
            return false;
        },
        search: function(e) {
            this.link = (e.target.value == '')? '' : `/search/?query=${encodeURI(e.target.value)}`;
            this.canFetch = false;
            this.photos = [];
            e.target.value = '';
            this.fetchPhotos();
            this.searchToggle();
        },
        goHome: function() {
            this.result = true;
            this.link = '';
            this.canFetch = false;
            this.fetchPhotos();
        }
    },
    created() {
        this.fetchPhotos();
        mousetrap.bind(['command+s', 'ctrl+s'], this.searchToggle);    
        window.addEventListener('scroll', this.handleScroll);
    },
    destroyed() {
        window.removeEventListener('scroll', this.handleScroll);
    }
});