var paths = {
    src: {
        less: "./src/less",
        html: "./src/html/emails",
        layout: "./src/html/layouts",
        images: "./src/img/**/*"
    },
    dist: "./dist",
    url: "http://www.google.com"
},
    gulp = require('gulp'),
    less = require('gulp-less'),
    prefixer = require('gulp-autoprefixer'),
    pipe = require('multipipe'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    inline_css = require('gulp-inline-css'),
    notify = require("gulp-notify"),
    template = require("gulp-template"),
    fs = require("fs"),
    changed = require("gulp-changed"),
    runSequence = require('run-sequence'),
    lr = require('tiny-lr'),
    embedlr = require("gulp-embedlr"),
    livereload = require('gulp-livereload'),
    urlAdjuster = require('gulp-css-url-adjuster'),
    gulpif = require('gulp-if'),
    prefix = require('gulp-prefix'),
    server = lr();

gulp.task('less', function() {
    return pipe(
        gulp.src(paths.src.less + "/main.less"),
        less(),
        prefixer('last 2 versions', 'ie 8'),
        concat("main.css"),
        gulpif( !! gulp.env.external, urlAdjuster({
            prepend: paths.url
        })),
        gulp.dest("./dist")
    );
});

gulp.task('responsive-less', function() {
    return pipe(
        gulp.src(paths.src.less + "/responsive.less"),
        less(),
        prefixer('last 2 versions', 'ie 8'),
        concat("responsive.css"),
        gulp.dest("./dist")
    );
});

gulp.task('wrap', function() {
    return pipe(
        gulp.src(paths.src.layout + "/default.html"),
        template({
            responsive: fs.readFileSync(paths.dist + "/responsive.css"),
            body: fs.readFileSync(paths.src.html + "/" + gulp.env.file + ".html"),
        }),
        rename("email.html"),
        gulp.dest(paths.dist)
    );
});

gulp.task('rewrite-html', function() {
    return pipe(
        gulp.src(paths.dist + "/email.html"),
        gulpif( !! gulp.env.external, prefix(paths.url, [{
            match: "img[src]",
            attr: "src"
        }, {
            match: "input[src]",
            attr: "src"
        }, {
            match: "img[data-ng-src]",
            attr: "data-ng-src"
        }])),
        gulp.dest(paths.dist)
    );
});

gulp.task('livereload', function() {
    server.listen(35729, function(err) {
        if (err) {
            return console.log(err);
        }
    });
});

gulp.task("inline-css", function() {
    return pipe(
        gulp.src(paths.dist + "/email.html"),
        inline_css({
            applyStyleTags: false,
            applyLinkTags: true,
            removeStyleTags: false,
            removeLinkTags: true
        }),
        gulp.dest(paths.dist)
    );
});

gulp.task("inline-css-debug", function() {
    return pipe(
        gulp.src(paths.dist + "/email.html"),
        embedlr({
            src: "http://localhost:35729/livereload.js?snipver=1"
        }),
        rename("email_debug.html"),
        gulp.dest(paths.dist),
        livereload(server),
        notify("[EMAIL] OK")
    );
});

gulp.task('images', function() {
    return pipe(
        gulp.src(paths.src.images),
        changed(paths.dist),
        gulp.dest(paths.dist)
    );
});

gulp.task('watch', function() {
    gulp.watch(paths.src.less + "/**/*.less", function() {
        runSequence(['images'], 'less', 'responsive-less', 'wrap', 'rewrite-html', 'inline-css', 'inline-css-debug');
    });
    gulp.watch(paths.src.html + "/" + gulp.env.file + ".html", function() {
        runSequence(['images'], 'less', 'responsive-less', 'wrap', 'rewrite-html', 'inline-css', 'inline-css-debug');
    });
    gulp.watch(paths.src.layout + "/default.html", function() {
        runSequence(['images'], 'less', 'responsive-less', 'wrap', 'rewrite-html', 'inline-css', 'inline-css-debug');
    });
});

gulp.task('dev', ['livereload', 'watch']);

gulp.task('build', runSequence(['images'], 'less', 'responsive-less', 'wrap', 'rewrite-html', "inline-css", "inline-css-debug"));
