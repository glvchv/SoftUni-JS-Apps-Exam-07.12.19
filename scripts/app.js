import * as r from './requester.js'

const app = Sammy('body', function () {
    this.use('Handlebars', 'hbs');

    function getPartials() {
        return {
            header: './templates/common/header.hbs',
            footer: './templates/common/footer.hbs'
        }
    }

    function saveAuthInfo(userInfo) {
        sessionStorage.setItem('authtoken', userInfo._kmd.authtoken);
        sessionStorage.setItem('username', userInfo.username);
        sessionStorage.setItem('userId', userInfo._id);
    }

    function setHeaderInfo(ctx) {
        ctx.isLogged = sessionStorage.getItem('authtoken') !== null;
        ctx.username = sessionStorage.getItem('username');
    }

    this.get('/', function (ctx) {
        setHeaderInfo(ctx);
        if (ctx.isLogged) {
            r.getReq('appdata', 'treks', 'Kinvey')
                .then(treks => {
                    ctx.treks = treks.sort((a, b) => b.likes - a.likes);
                    this.loadPartials(getPartials()).partial('./templates/home/home.hbs');
                })
        } else {
            this.loadPartials(getPartials()).partial('./templates/home/home.hbs')
        }

    })

    this.get('/register', function (ctx) {
        setHeaderInfo(ctx);
        this.loadPartials(getPartials()).partial('./templates/register/register.hbs')
    })
    this.post('/register', function (ctx) {
        setHeaderInfo(ctx);
        const {
            username,
            password,
            rePassword
        } = ctx.params;
        if (username && password && password === rePassword) {
            r.postReq('user', '', {
                    username,
                    password
                }, 'Basic')
                .then(userInfo => {
                    saveAuthInfo(userInfo);
                    ctx.redirect('/login')
                })
        }
    })

    this.get('/login', function (ctx) {
        //setHeaderInfo(ctx);
        this.loadPartials(getPartials()).partial('./templates/login/login.hbs')
    })
    this.post('/login', function (ctx) {
        const {
            username,
            password
        } = ctx.params;
        if (username && password) {
            r.postReq('user', 'login', {
                    username,
                    password
                }, 'Basic')
                .then((userInfo) => {
                    saveAuthInfo(userInfo);
                    ctx.redirect('/')
                })
        }
    })

    this.get('/logout', function (ctx) {
        r.postReq('user', '_logout', {}, 'Kinvey')
            .then(() => {
                sessionStorage.clear();
                ctx.redirect('/')
            })
    })

    this.get('/create', function (ctx) {
        setHeaderInfo(ctx);
        this.loadPartials(getPartials()).partial('./templates/newTrek/createPage.hbs');
    })

    this.post('/create', function (ctx) {
        setHeaderInfo(ctx)
        const {
            location,
            dateTime,
            description,
            imageURL
        } = ctx.params;
        const organizer = ctx.username;
        const likes = 0;
        r.postReq('appdata', 'treks', {
                location,
                dateTime,
                description,
                imageURL,
                organizer,
                likes
            }, 'Kinvey')
            .then(() => {
                ctx.redirect('/')
            })
    })

    this.get('/details/:id', function (ctx) {
        setHeaderInfo(ctx);
        const id = ctx.params.id;
        r.getReq('appdata', `treks/${id}`, 'Kinvey')
            .then((trek) => {
                if (trek._acl.creator === sessionStorage.getItem('userId')) {
                    ctx.isAuth = true;
                }
                ctx.trek = trek;
                this.loadPartials(getPartials()).partial('../templates/details/details.hbs')
            })
    })

    this.get('/edit/:id', function (ctx) {
        setHeaderInfo(ctx);
        const id = ctx.params.id;
        r.getReq('appdata', `treks/${id}`, 'Kinvey')
            .then(trek => {
                ctx.trek = trek;
                this.loadPartials(getPartials()).partial('../templates/edit/editPage.hbs')
            })
    })

    this.post('/edit/:id', function (ctx) {
        const id = ctx.params.id;
        const {
            location,
            dateTime,
            description,
            imageURL,
            organizer,
            likes
        } = ctx.params;
        r.putReq('appdata', `treks/${id}`, {
                location,
                dateTime,
                description,
                imageURL,
                organizer,
                likes
            }, 'Kinvey')
            .then(() => {
                ctx.redirect(`/details/${id}`)
            })
    })

    this.get('/like/:id', function (ctx) {
        const id = ctx.params.id;
        r.getReq('appdata', `treks/${id}`, 'Kinvey')
            .then(trek => {
                let likes = Number(trek.likes);
                const {
                    location,
                    dateTime,
                    description,
                    imageURL,
                    organizer
                } = trek;
                likes += 1;
                r.putReq('appdata', `treks/${id}`, {
                        location,
                        dateTime,
                        description,
                        imageURL,
                        organizer,
                        likes
                    }, 'Kinvey')
                    .then(() => {
                        ctx.redirect(`details/${id}`);
                    })
            })
    })

    this.get('/close/:id', function (ctx) {
        const id = ctx.params.id;
        r.deleteReq('appdata', `treks/${id}`, 'Kinvey')
            .then(() => {
                ctx.redirect('/')
            })
    })

    this.get('/profile', function (ctx) {
        setHeaderInfo(ctx);
        r.getReq('appdata', 'treks', 'Kinvey')
            .then(treks => {
                ctx.treks = treks.filter(x => x.organizer === ctx.username);
                ctx.treksLength = ctx.treks.length;
                this.loadPartials(getPartials()).partial('./templates/common/profile.hbs')
            })
    })


})
app.run();