module.exports = {
    options: {
        enabled: true,
        title: "Grunt: <%= pkg.name %>", // defaults to the name in package.json, or will use project directory's name 
        max_jshint_notifications: 5, // maximum number of notifications from jshint output 
        success: false, // whether successful grunt executions should be notified automatically 
        duration: 3 // the duration of notification in seconds, for `notify-send only 
    },
};