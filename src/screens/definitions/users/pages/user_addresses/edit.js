import React, { useEffect, useState } from 'react'
import { TDrawer } from 'components'
import { useHistory, useParams } from 'react-router-dom'
import { fields } from '../../constants/user_addresses/create_fields'
import { Button, TextField, CircularProgress, Autocomplete } from '@mui/material'
import service from '../../service'
import { NotificationManager } from 'react-notifications'
import './style.scss'
import ConnectJs from 'utils/yerlem-connect'

function Edit() {
  const history = useHistory()
  const [fieldsData, setFieldsData] = useState(fields())
  const [isLoading, setIsLoading] = useState(false)
  const routeParams = useParams()
  const [autoOptions, setAutoOptions] = useState({
    users: []
  })
  const [map, setMap] = useState()
  const connect = new ConnectJs()
  const leaflet_config = {
    elementId: 'user-address-leafletmap',
    coordinate: [37.93382, 32.50223],
    zoom: 10,
    tileLayer: 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
  }

  useEffect(() => {
    mapInitial()
    getUserAddresses()
  }, [])

  function closeDrawer() {
    setTimeout(() => {
      history.goBack()
    }, 300)
  }

  function mapInitial(coordinate) {
    if (map) map.remove()
    connect.initMap(coordinate ? {...leaflet_config, coordinate} : leaflet_config)
    setMap(connect.getLeafletMap())
    connect.enablePolylineMeasure()
    connect.enableZoomBox()
    connect.enableMarkerCluster()
    if (coordinate) connect.addMarker(coordinate)
    return () => {
      map?.remove()
    }
  }


  async function getUserAddresses() {
    setIsLoading(true)
    const newFieldsData = [...fieldsData]
    const response = await service.getUserAddress(routeParams.id)
    const res_userAddresses = response?.data?.data
    for (const userAddresses_key in res_userAddresses) {
      const userAddresses_value = res_userAddresses[userAddresses_key]
      const index = newFieldsData.findIndex((value) => value.key === userAddresses_key)
      if (index !== -1) newFieldsData[index].defaultValue = userAddresses_value
    }

    const newAutoOptions = { ...autoOptions }
    const params = {
      size: 99999,
      page: 0
    }
    const res = await service.getUsers(params)
    newAutoOptions['users'] = res?.data?.data
    setAutoOptions(newAutoOptions)
    setFieldsData(newFieldsData)
    setIsLoading(false)
  }

  async function updateFormData() {
    const payload = {}
    for (const key in fieldsData) {
      const field = fieldsData[key]
      payload[field.key] = field.defaultValue
    }
    const result = await service.updateUserAddress(payload)
    if ([200, 201].includes(result?.status)) {
      closeDrawer()
      NotificationManager.success('Kullanıcı adresi başarılı bir şekilde güncellendi')
    } else {
      NotificationManager.error('Kullanıcı adresi güncellenirken hata oluştu')
    }
  }

  function addMarker() {
    const coordinates = fieldsData?.find((e) => e.key === 'coordinate')?.defaultValue
    const result = /^([-+]?)([\d]{1,2})(((\.)(\d+)(,)))(\s*)(([-+]?)([\d]{1,3})((\.)(\d+)))$/.test(coordinates)
    if (result) mapInitial(coordinates.split(','))
    else mapInitial()
  }

  return (
    <div>
      <TDrawer closeDrawer={closeDrawer} title="Kullanıcı Adresi">
        <div style={{ padding: '20px', marginBottom: '230px' }}>
          <div id="user-address-leafletmap" className="leafletmap"></div>
          {fieldsData.map((field, key) =>
            !field.notShow ? (
              field.type === 'auto' ? (
                <Autocomplete
                  sx={{ marginTop: 3 }}
                  key={key}
                  disablePortal
                  value={fieldsData[key].defaultValue}
                  options={autoOptions[field.options]}
                  getOptionLabel={field.label}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderInput={(params) => {
                    return <TextField {...params} label={field.placeHolder} />
                  }}
                  onChange={(event, newValue) => {
                    const newFieldsData = [...fieldsData]
                    newFieldsData[key].defaultValue = newValue
                    return setFieldsData(newFieldsData)
                  }}
                />
              ) : (
                <TextField
                  sx={{ marginTop: 3 }}
                  type={field.type}
                  size="small"
                  label={field.placeHolder}
                  variant="outlined"
                  fullWidth
                  key={key}
                  value={fieldsData[key].defaultValue}
                  onChange={(e) => {
                    const newFieldsData = [...fieldsData]
                    newFieldsData[key].defaultValue = e.target.value
                    return setFieldsData(newFieldsData)
                  }}
                />
              )
            ) : null
          )}
          <div
            style={{
              display: 'flex',
              gridGap: 10,
              marginTop: 30,
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Button variant="outlined" onClick={addMarker} disabled={isLoading}>
              Haritada Göster
            </Button>
            <Button variant="contained" onClick={updateFormData} disabled={isLoading}>
              Kaydet
            </Button>
          </div>
        </div>
      </TDrawer>
    </div>
  )
}

export default Edit
