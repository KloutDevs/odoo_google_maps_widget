# -*- coding: utf-8 -*-
#
#    Copyright (C) 2024 Nahuel Schmidt
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
{
    'name': 'Google Map Widget',
    'version': '1.0.0',
    'category': 'Tools',
    'summary': """The Google Map widget allows users to select or search a location in different ways.""",
    'description': """The Google Map Widget is a custom Odoo 17 module that seamlessly 
    integrates Google Maps into your Odoo environment, providing users with powerful 
    map-based functionalities. With this widget, users can search, select, and pinpoint 
    locations on a map and retrieve corresponding address information using Google Maps API. 
    Ideal for businesses that need to manage geographical data efficiently, this module 
    enhances user experience by simplifying the process of location selection and address 
    retrieval in Odoo.""",
    'author': 'Nahuel Schmidt.',
    'maintainer': 'Nahuel Schmidt.',
    'website': 'https://github.com/KloutDevs',
    'depends': ['base'],
    'assets': {
        'web.assets_backend': [
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
