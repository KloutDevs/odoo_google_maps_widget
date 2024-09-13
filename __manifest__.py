{
    'name': 'Google Map Widget',
    'version': '1.0.0',
    'category': 'Tools',
    'summary': """The Google Map widget allows users to select or search a location in different ways.""",
    'description': """TThe Google Map widget allows users to identify 
            a location on the map and retrieve the corresponding address by selection or autocompletion using a Char field.
            This feature provides an easy way to search and get directions or locations on the map using the Google Maps API.""",
    'author': 'Nahuel Schmidt.',
    'maintainer': 'Nahuel Schmidt.',
    'website': 'https://github.com/KloutDevs',
    'depends': ['base'],
    'assets': {
        'web.assets_backend': [
            'https://maps.googleapis.com/maps/api/js?key=AIzaSyC0gErzrxXjyNtDDFDVKmLfclkciKZcBJs&libraries=places',
            'google_map_widget/static/src/js/google_maps_widget.js',
            'google_map_widget/static/src/js/google_maps_loader.js',
            'google_map_widget/static/src/xml/google_maps_widget.xml',
            'google_map_widget/static/src/css/google_maps_widget.css',
        ],
    },
    'data': [
            'views/res_config_settings_views.xml',
    ],
    'images': [],
    'license': 'AGPL-3',
    'installable': True,
    'auto_install': False,
    'application': False,
}
