class IncidentRepositoryImpl(private val api: IncidentApiService) : IncidentRepository {
    override suspend fun reportIncident(incident: Incident) {
        api.postIncident(incident.toDto())
    }

    override suspend fun fetchIncidents(): List<Incident> {
        return api.getIncidents().map { it.toDomain() }
    }
}
