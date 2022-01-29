import React, { useEffect, useState } from 'react'
import { CustomInput, TDrawer } from 'components'
import { useHistory, useParams } from "react-router-dom"
import { fields } from '../../constants/entities/create_fields'
import { Button, TextField, CircularProgress, Autocomplete } from '@mui/material'
import service from '../../service';
import { NotificationManager } from 'react-notifications';
import { toIsoString } from 'utils/locale'

function Edit() {
    const history = useHistory();
    const [fieldsData, setFieldsData] = useState(fields())
    const [isLoading, setIsLoading] = useState(false)
    const params = useParams()
    const [autoOptions, setAutoOptions] = useState({
        types: [],
        users: []
    })

    useEffect(() => {
        getData()
    }, [])

    function closeDrawer() {
        setTimeout(() => {
            history.goBack()
        }, 300);
    }

    async function getData() {
        setIsLoading(true)
        const p = {
            page: 0,
            size: 99999
        }
        const newFieldsData = [...fieldsData]
        const response = await service.getEntity(params.id)
        const res = response?.data?.data
        for (const key in res) {
            const value = res[key];
            const index = newFieldsData.findIndex((value) => value.key === key)
            if (index !== -1)
                newFieldsData[index].defaultValue = value
        }
        const newAutoOptions = { ...autoOptions }
        const res_type = await service.getEntityTypes(p)
        newAutoOptions["types"] = res_type?.data?.data
        const res_user = await service.getUsers(p)
        newAutoOptions["users"] = res_user?.data?.data
        setAutoOptions(newAutoOptions)
        setFieldsData(newFieldsData)
        setIsLoading(false)
    }

    async function updateFormData() {
        const payload = {}
        for (const fieldKey in fieldsData) {
            const field = fieldsData[fieldKey];
            if (field.type === 'datetimeOffset')
                toIsoString(field.defaultValue)
            else
                payload[field.key] = field.defaultValue
        }
        const result = await service.updateEntity(payload)
        if ([200, 201].includes(result?.status)) {
            setFieldsData(fields())
            closeDrawer()
            NotificationManager.success("Varlık  başarılı bir şekilde güncellendi")
        } else {
            NotificationManager.error("Varlık  güncellenirken bir hata ile karşılaşıldı")
        }
    }

    return (
        <div>
            <TDrawer closeDrawer={closeDrawer} title="Varlık Düzenle">
                {
                    isLoading ?
                        <CircularProgress /> :
                        <div style={{ padding: '20px' }}>
                            {
                                fieldsData.map((field, key) => !field.notShow ?
                                    (
                                        <CustomInput
                                            type={field.type}
                                            key={key}
                                            options={autoOptions[field.options]}
                                            getOptionLabel={field.label}
                                            isOptionEqualToValue={(option, value) => option.id === value.id}
                                            label={field.placeHolder}
                                            size="small"
                                            variant="outlined"
                                            fullWidth={field.fullWidth || true}
                                            value={fieldsData[key].defaultValue}
                                            onChange={(event, newValue) => {
                                                const newFieldsData = [...fieldsData]
                                                newFieldsData[key].defaultValue = newValue
                                                return setFieldsData(newFieldsData)
                                            }}
                                        />
                                    )
                                    : null)
                            }
                            <div style={{
                                display: 'flex',
                                gridGap: 10,
                                marginTop: 30,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Button variant="contained" onClick={updateFormData}>Güncelle</Button>
                            </div>
                        </div>
                }
            </TDrawer>
        </div>
    )
}

export default Edit