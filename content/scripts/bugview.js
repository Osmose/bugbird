jsLoader.loadSubScript('chrome://bugbird/content/scripts/ejs.js');
jsLoader.loadSubScript('chrome://bugbird/content/scripts/view.js');

viewHelpers = {};

window.addEventListener('message', showBug, false);
function showBug(e) {
    var bug = JSON.parse(e.data);
    try {
        var html = new EJS({url: 'chrome://bugbird/content/bugview/template.ejs'})
                .render({bug: bug}, viewHelpers);
        $('body').html(html);
    } catch (e) {
        alert(e.toSource());
    }
}