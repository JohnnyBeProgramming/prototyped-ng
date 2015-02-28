var features = {};
try {
    alert('Ping!');

    // Try and detect some features
    features['jQuery'] = typeof jQuery !== 'undefined' ? jQuery.fn.jquery.split(' ')[0].split('.') : false;
    //features['Bootstrap'] = typeof Button !== 'undefined' && Button.VERSION;
    features['Modernizr'] = typeof Modernizr !== 'undefined';
    features['less'] = typeof less !== 'undefined';
    features['jQuery'] = typeof jQuery !== 'undefined';
    features['jQuery'] = typeof jQuery !== 'undefined';
    features['$script'] = typeof $script !== 'undefined';
    features['angular'] = typeof angular !== 'undefined';
    features['Mousetrap'] = typeof Mousetrap !== 'undefined';
    features['StringPrototyped'] = typeof Mousetrap !== 'undefined';
    features['SCSU'] = typeof SCSU !== 'undefined';
}
catch (ex) {
    console.error(ex);
} finally {
    console.debug(' - Features detected', features);
}