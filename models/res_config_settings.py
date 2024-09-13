# -*- coding: utf-8 -*-

from odoo import api, fields, models

class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    google_map_default_latitude = fields.Float(string="Default Latitude", config_parameter='google_map_widget.default_latitude')
    google_map_default_longitude = fields.Float(string="Default Longitude", config_parameter='google_map_widget.default_longitude')
    google_map_default_country = fields.Char(string="Default Country Code", config_parameter='google_map_widget.default_country')
    google_map_api_key = fields.Char(string="Google Maps API Key", config_parameter='google_map_widget.api_key')

    @api.model
    def get_values(self):
        res = super(ResConfigSettings, self).get_values()
        ICPSudo = self.env['ir.config_parameter'].sudo()
        res.update(
            google_map_default_latitude=float(ICPSudo.get_param('google_map_widget.default_latitude', default=0.0)),
            google_map_default_longitude=float(ICPSudo.get_param('google_map_widget.default_longitude', default=0.0)),
            google_map_default_country=ICPSudo.get_param('google_map_widget.default_country', default='ar'),
            google_map_api_key=ICPSudo.get_param('google_map_widget.api_key', default=''),
        )
        return res

    def set_values(self):
        super(ResConfigSettings, self).set_values()
        ICPSudo = self.env['ir.config_parameter'].sudo()
        ICPSudo.set_param('google_map_widget.default_latitude', self.google_map_default_latitude)
        ICPSudo.set_param('google_map_widget.default_longitude', self.google_map_default_longitude)
        ICPSudo.set_param('google_map_widget.default_country', self.google_map_default_country)
        ICPSudo.set_param('google_map_widget.api_key', self.google_map_api_key)