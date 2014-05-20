var paths = {
    src: {
        less: "./src/less",
        html: "./src/html/emails",
        layout: "./src/html/layouts",
    },
    dist: "./dist"
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
    runSequence = require('run-sequence'),
    lr = require('tiny-lr'),
    embedlr = require("gulp-embedlr"),
    server = lr();

gulp.task('less', function() {
    return pipe(
        gulp.src(paths.src.less + "/main.less"),
        less(),
        prefixer('last 2 versions', 'ie 8'),
        concat("main.css"),
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
        embedlr(),
        rename("email_debug.html"),
        gulp.dest(paths.dist)
    );
});

gulp.task('watch', function() {
    gulp.watch(paths.src.less + "/**/*.less", function() {
        runSequence('less', 'responsive-less', 'wrap', 'inline-css', 'inline-css-debug');
    });
    gulp.watch(paths.src.html + "/" + gulp.env.file + ".html", function() {
        runSequence('less', 'responsive-less', 'wrap', 'inline-css', 'inline-css-debug');
    });
    gulp.watch(paths.src.layout + "/default.html", function() {
        runSequence('less', 'responsive-less', 'wrap', 'inline-css', 'inline-css-debug');
    });
    gulp.watch(paths.dist + "/email_debug.html").on('change', function(file) {
        server.changed(file.path);
    });
});

gulp.task('dev', ['livereload', 'watch']);

gulp.task('build', runSequence('less', 'responsive-less', 'wrap', "inline-css", "inline-css-debug"));
