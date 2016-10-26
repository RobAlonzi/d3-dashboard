var gulp = require("gulp"),
    $ = require("gulp-load-plugins")()


const config = {
    styles: {
        src: ["./scss/application.scss"],
        watchSrc: './scss/*.scss',
        dest: "./dist/css",
        autoprefix: ["last 2 versions"]
    },

    scripts: {
        src : './js/application.js',
        watchSrc: './js/*.{js,json}',
        dest: "./dist/js"
    }
}   



gulp.task("dev:styles", devStyles);
gulp.task("dev:scripts", devScripts);
gulp.task("dev", gulp.parallel("dev:styles","dev:scripts"));
gulp.task("dev:watch", gulp.series("dev", devWatch));

gulp.task("prod:styles", prodStyles);
gulp.task("prod:scripts", prodScripts);
gulp.task("prod", gulp.parallel("prod:scripts","prod:styles"));
gulp.task("default", gulp.series("dev"));


function devWatch() {
    gulp.watch(config.styles.watchSrc, gulp.series("dev:styles"));
    gulp.watch(config.scripts.watchSrc, gulp.series("dev:scripts"));
}



function devStyles(){
    return gulp
        .src(config.styles.src)
        .pipe($.sourcemaps.init())
        .pipe($.sass())
        .pipe($.autoprefixer({
            browsers: config.styles.autoprefix
        }))
        .pipe($.sourcemaps.write("."))
        .pipe(gulp.dest(config.styles.dest));
}



function prodStyles(){
    return gulp
            .src(config.styles.src)
            .pipe($.sass())
            .pipe($.autoprefixer({
                browsers: config.styles.autoprefix
            }))
            .pipe($.cleanCss())
            .pipe(gulp.dest(config.styles.dest));
}




function devScripts() {

gulp.src('./js/data.json')
    .pipe(gulp.dest(config.scripts.dest));

 return gulp
        .src(config.scripts.src)
        .pipe($.babel({
            presets: ['es2015'],
            plugins: ['transform-es2015-modules-commonjs']
         }))
        .pipe(gulp.dest(config.scripts.dest));
};


function prodScripts() {

gulp.src('./js/data.json')
    .pipe(gulp.dest(config.scripts.dest));

 return gulp
        .src(config.scripts.src)
        .pipe($.babel({
            presets: ['es2015'],
            plugins: ['transform-es2015-modules-commonjs']
         }))
        .pipe($.uglify())
        .pipe(gulp.dest(config.scripts.dest));
};  



// Copy vendor libraries from /bower_components into /vendor
gulp.task('copy', function() {
    gulp.src(['bower_components/bootstrap/dist/**/*', '!**/npm.js', '!**/bootstrap-theme.*', '!**/*.map'])
        .pipe(gulp.dest('vendor/bootstrap'))

    gulp.src(['bower_components/font-awesome/**/*', '!bower_components/font-awesome/*.json', '!bower_components/font-awesome/.*'])
        .pipe(gulp.dest('vendor/font-awesome'))

    gulp.src(['bower_components/jquery/dist/jquery.js', 'bower_components/jquery/dist/jquery.min.js'])
        .pipe(gulp.dest('vendor/jquery'))

})



