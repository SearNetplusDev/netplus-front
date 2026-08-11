<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { api } from 'src/utils/api.js'
import { useLoading } from 'src/utils/loader.js'
import { useNotifications } from 'src/utils/notification.js'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { useQuasar } from 'quasar'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const { showLoading, hideLoading } = useLoading()
const { showNotification } = useNotifications()
const $q = useQuasar()
const props = defineProps({
  visible: { type: Boolean, required: true },
  service: { type: Number, required: true },
})
const emit = defineEmits(['update:visible', 'hide'])
const isVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})
const serviceData = ref([])
const mapContainer = ref(null)
const currentView = ref('hybrid')
let map = null
let marker = null
let currentTileLayer = null
let labelsLayer = null
const mapViews = [
  {
    label: 'Satélite',
    value: 'satellite',
    icon: 'satellite_alt',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution:
      '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 20,
  },
  {
    label: 'Híbrido',
    value: 'hybrid',
    icon: 'layers',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', // y = satélite + calles + nombres
    attribution: '&copy;Google',
    maxZoom: 20,
  },
  {
    label: 'Calles',
    value: 'streets',
    icon: 'map',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  },
  {
    label: 'Oscuro',
    value: 'dark',
    icon: 'dark_mode',
    url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>',
    maxZoom: 20,
  },
  {
    label: 'Relieve',
    value: 'terrain',
    icon: 'terrain',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution:
      '&copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
    maxZoom: 20,
  },
]
const destinationCoords = computed(() => {
  const lat = parseFloat(serviceData.value.latitude)
  const lng = parseFloat(serviceData.value.longitude)

  if (Number.isNaN(lat) || Number.isNaN(lng)) return null
  return { lat, lng }
})
const openGoogleMapsDirections = () => {
  if (!destinationCoords.value) return
  const { lat, lng } = destinationCoords.value
  window.open(
    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`,
    '_blank',
  )
}
const openWazeDirections = () => {
  if (!destinationCoords.value) return
  const { lat, lng } = destinationCoords.value
  window.open(`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`, '_blank')
}
const getServiceLocation = async () => {
  showLoading()
  try {
    const { data } = await api.post('/api/v1/services/edit', { id: props.service, _method: 'POST' })
    if (data) {
      serviceData.value = data.service
      await nextTick()
      renderMap()
    } else {
      showNotification('Error', 'Ha ocurrido algo inesperado', 'red-10')
    }
  } catch (err) {
    showNotification(
      'Error',
      err.response?.data?.message ?? err.message ?? 'Error inesperado',
      'red-10',
    )
  } finally {
    setTimeout(() => {
      hideLoading()
    }, 150)
  }
}
const renderMap = () => {
  if (!mapContainer.value) return

  const lat = parseFloat(serviceData.value.latitude)
  const lng = parseFloat(serviceData.value.longitude)

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    showNotification('Advertencia', 'Este servicio no tiene coordenadas registradas', 'orange-8')
    return
  }

  if (map) {
    map.remove()
    map = null
  }

  /**
   * Sin selección de tipos de vista
   */

  // map = L.map(mapContainer.value).setView([lat, lng], 16)
  // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //   attribution: '&copy; OpenStreetMap contributors',
  //   maxZoom: 19,
  // }).addTo(map)
  //

  /**
   * Seleccionando vista.
   */
  map = L.map(mapContainer.value, {
    zoomControl: true,
    attributionControl: true,
    preferCanvas: true,
  }).setView([lat, lng], 16)

  changeMapView(currentView.value)

  marker = L.marker([lat, lng]).addTo(map)
  marker.bindPopup(`<strong>${serviceData.value.address ?? 'Sin dirección'}</strong>`).openPopup()

  L.control
    .scale({
      imperial: false,
      metric: true,
      position: 'bottomleft',
    })
    .addTo(map)

  setTimeout(() => {
    map?.invalidateSize()
  }, 300)
}
const changeMapView = (viewType) => {
  if (!map) return
  currentView.value = viewType

  if (currentTileLayer) {
    map.removeLayer(currentTileLayer)
    currentTileLayer = null
  }

  if (labelsLayer) {
    map.removeLayer(labelsLayer)
    labelsLayer = null
  }
  const viewConfig = mapViews.find((v) => v.value === viewType)
  if (!viewConfig) return

  if (viewType === 'hybrid') {
    currentTileLayer = L.layerGroup([
      L.tileLayer(viewConfig.url, {
        attribution: viewConfig.attribution,
        maxZoom: viewConfig.maxZoom,
      }).addTo(map),

      (labelsLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}', {
        attribution: '',
        maxZoom: 20,
        opacity: 0.9,
      }).addTo(map)),
    ]).addTo(map)
  } else if (viewType === 'satellite') {
    currentTileLayer = L.tileLayer(viewConfig.url, {
      attribution: viewConfig.attribution,
      maxZoom: viewConfig.maxZoom,
    }).addTo(map)
  } else {
    currentTileLayer = L.tileLayer(viewConfig.url, {
      attribution: viewConfig.attribution,
      maxZoom: viewConfig.maxZoom,
    }).addTo(map)
  }
}

watch(isVisible, (val) => {
  if (!val && map) {
    map.remove()
    map = null
    currentTileLayer = null
  }
})

onMounted(async () => {
  await getServiceLocation()
})

onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
    currentTileLayer = null
  }
})
</script>

<template>
  <q-dialog
    v-model="isVisible"
    dark
    persistent
    backdrop-filter="blur(5px) saturate(150%)"
    transition-show="slide-up"
    transition-hide="jump-down"
  >
    <q-card class="custom-cards q-pa-xs full-width" flat dark>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-white">Ubicación del cliente.</div>
        <q-space />

        <!--    Selector de vistas    -->
        <q-btn-group flat rounded class="q-mr-sm">
          <q-btn
            v-for="view in mapViews"
            :key="view.value"
            :icon="view.icon"
            :color="currentView === view.value ? 'blue-10' : 'grey-9'"
            :text-color="currentView === view.value ? 'amber-3' : 'grey-4'"
            size="sm"
            @click="changeMapView(view.value)"
          >
            <q-tooltip class="bg-grey-10">Seleccionar vista: {{ view.label }}</q-tooltip>
          </q-btn>
        </q-btn-group>

        <q-btn icon="close" flat round dense v-close-popup color="white" />
      </q-card-section>

      <!--      <q-card-section class="row fit content-end justify-end">-->
      <!--        <div ref="mapContainer" class="map-container" />-->
      <!--      </q-card-section>-->

      <q-card-section class="q-pa-none relative-position">
        <div class="view-indicator q-pa-xs">
          <q-badge color="blue-10" text-color="white" class="q-px-sm q-py-xs">
            <q-icon
              :name="mapViews.find((v) => v.value === currentView)?.icon"
              size="xs"
              class="q-mr-xs"
            />
            {{ mapViews.find((v) => v.value === currentView)?.label }}
          </q-badge>
        </div>

        <div ref="mapContainer" class="map-container" />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn-dropdown
          v-if="$q.platform.is.mobile"
          icon="directions"
          label="como llegar?"
          color="primary"
          :disable="!destinationCoords"
        >
          <q-list>
            <q-item clickable v-close-popup @click="openGoogleMapsDirections">
              <q-item-section avatar>
                <q-icon name="mdi-google-maps" color="primary" />
              </q-item-section>
              <q-item-section>Google Maps</q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="openWazeDirections">
              <q-item-section avatar>
                <q-icon name="mdi-waze" color="blue-5" />
              </q-item-section>
              <q-item-section>Waze</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <q-btn
          v-else
          icon="directions"
          label="como llegar?"
          color="primary"
          :disable="!destinationCoords"
          @click="openGoogleMapsDirections"
        />
        <q-btn icon="close" label="cerrar" color="negative" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped lang="sass">
.custom-cards
  width: 95vw
  max-width: 900px
  border-radius: 1em

//.map-container
//  width: 100%
//  height: 400px
//  border-radius: 0.5em

.map-container
  width: 100%
  height: 500px
  position: relative

.view-indicator
  position: absolute
  top: 10px
  right: 10px
  z-index: 1000
  background: rgba(0, 0, 0, 0.6)
  border-radius: 8px
  pointer-events: none

.view-select
  width: 200px

  :deep(.q-field__control)
    min-height: 36px

// Mejoras visuales para los botones de vista
:deep(.q-btn-group)
  .q-btn
    transition: all 0.3s ease

    &:hover
      transform: scale(1.1)

// Responsive
@media (max-width: 768px)
  .custom-cards
    width: 95vw
    max-width: 95vw

  .map-container
    height: 350px

  .view-select
    width: 150px
</style>
