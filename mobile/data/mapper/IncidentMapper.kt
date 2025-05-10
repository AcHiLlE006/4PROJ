fun Incident.toDto(): IncidentDto = IncidentDto(id, type, location.latitude, location.longitude, validated)
fun IncidentDto.toDomain(): Incident = Incident(id, type, LatLng(lat, lng), validated)