/** @odoo-module **/

import { _t } from "@web/core/l10n/translation";
import { useService } from "@web/core/utils/hooks";
import { CharField } from "@web/views/fields/char/char_field";
import { useRef, useState, onMounted } from "@odoo/owl";
import { registry } from "@web/core/registry";

export class GoogleMapsWidget extends CharField {
    setup() {
        super.setup();
        this.orm = useService('orm');
        this.mapContainerRef = useRef('mapContainer');
        this.state = useState({
            latitude: -27.3963033,
            longitude: -55.9657155,
            address: '',
            currentMarker: null,
        });
        this.map = null;
        onMounted(() => this._initializeMap());
    }

    async _initializeMap() {
        const mapContainer = this.mapContainerRef.el;

        console.log("Map Container")
        console.log(mapContainer)
        console.log(`PROPS`)
        console.log(this.props)
        
        
        if (!mapContainer) {
            console.error('Map container not found.');
            return;
        }
        
        const value = this.props.record.data[this.props.name] || '';
        console.log(`VALUE ${value}`)
        if (value) {
            this.state.address = value;
            await this.getLatLngFromAddress(value);
        }

        this.map = new google.maps.Map(mapContainer, {
            center: { lat: this.state.latitude, lng: this.state.longitude },
            zoom: 13
        });

        this.state.currentMarker = new google.maps.Marker({
            position: { lat: this.state.latitude, lng: this.state.longitude },
            map: this.map,
            title: 'Selected Location'
        });

        this.map.addListener('click', async (event) => {

            console.log("GOOGLE MAP CLICK EVENT")
            console.log(event)
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            this.state.latitude = lat;
            this.state.longitude = lng;
            console.log(`Latitud Sin Establecer: ${lat}`)
            console.log(`Longitud Sin Establecer: ${lng}`)
            console.log(`Latitud Establecida: ${this.state.latitude}`)
            console.log(`Longitud Establecida: ${this.state.longitude}`)

            try {
                const address = await this.getAddressFromLatLng(lat, lng);
                console.log("DIRECCIÓN MAPA: "+address);
                await this.updateFieldValue(address);
            } catch (error) {
                console.error('Error fetching address:', error);
            }

            if (this.state.currentMarker) {
                console.log(`BEFORE STATE OF CURRENTMARKER DEFINE`)
                console.log(this.state)
                this.state.currentMarker.setMap(null);
                console.log(`AFTER STATE OF CURRENTMARKER DEFINE`)
                console.log(this.state)
            }

            this.state.currentMarker = new google.maps.Marker({
                position: { lat, lng },
                map: this.map,
                title: 'Ubicación Seleccionada'
            });
        });
    }

    async getAddressFromLatLng(latitude, longitude) {
        return new Promise((resolve, reject) => {
            const geocoder = new google.maps.Geocoder();
            const latlng = { lat: latitude, lng: longitude };

            geocoder.geocode({ location: latlng }, (results, status) => {
                if (status === "OK" && results[0]) {
                    resolve(results[0].formatted_address);
                } else {
                    reject(status === "OK" ? "No results found" : `Geocoder failed due to: ${status}`);
                }
            });
        });
    }

    async getLatLngFromAddress(address) {
        return new Promise((resolve, reject) => {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ address: address }, (results, status) => {
                if (status === "OK" && results[0]) {
                    const { lat, lng } = results[0].geometry.location;
                    this.state.latitude = lat();
                    this.state.longitude = lng();
                    resolve({ lat: lat(), lng: lng() });
                } else {
                    reject(status === "OK" ? "No results found" : `Geocoder failed due to: ${status}`);
                }
            });
        });
    }

    async updateFieldValue(value) {
        await this.props.record.update({ [this.props.name]: value });
    }

    async _OpenMapview() {
        const { longitude, latitude } = this.state;
        if (latitude && longitude) {
            window.open(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`, '_blank');
        }
    }
}

GoogleMapsWidget.template = 'GoogleMapsWidget';

export const googleMapsWidget = {
    component: GoogleMapsWidget,
    supportedTypes: ['char'],
    displayName: _t("Google Maps Widget"),
    extractProps: ({ attrs, options }) => ({
        isPassword: attrs.password === "true",
        placeholder: attrs.placeholder,
    }),
};

registry.category("fields").add("google_maps_widget", googleMapsWidget);