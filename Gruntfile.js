/*global module:false*/
module.exports = function(grunt) {
    var unminifiedFile = 'dist/<%= pkg.name %>.js';
    var minifiedFile = 'dist/<%= pkg.name %>.min.js';
    
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        meta: {
            banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
                '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
                ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
        },
        lint: {
            files: ['src/**/*.js', 'test/**/*.js']
        },
        qunit: {
            files: ['test/**/*.html']
        },
        concat: {
            dist: {
                src: [
                    '<banner:meta.banner>',
                    'src/core.js',
                    'src/level.js',
                    'src/timer.js',
                    'src/layout.js',
                    'src/renderer.js',
                    'src/loggingevent.js',
                    'src/appender.js',
                    'src/formatobjectexpansion.js',
                    'src/nulllayout.js',
                    'src/simplelayout.js',
                    'src/httppostdatalayout.js',
                    'src/jsonlayout.js',
                    'src/xmllayout.js',
                    'src/simpledateformat.js',
                    'src/patternlayout.js',
                    'src/alertappender.js',
                    'src/browserconsoleappender.js'
                ],
                dest: unminifiedFile
            }
        },
        min: {
            dist: {
                src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
                dest: 'dist/<%= pkg.name %>.min.js'
            }
        },
        watch: {
            files: '<config:lint.files>',
            tasks: 'lint qunit'
        },
        jshint: {
            options: {
                curly: true,
                eqeqeq: false,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true,
                browser: true
            },
            globals: {
                jQuery: false
            },
            afterconcat: [unminifiedFile]
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: unminifiedFile,
                dest: minifiedFile
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-qunit');

    // Default task.
    grunt.registerTask('default', ['jshint'/*, 'qunit'*/, 'concat', 'uglify']);
};
