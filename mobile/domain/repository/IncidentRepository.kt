interface IncidentRepository {
    suspend fun reportIncident(incident: Incident)
    suspend fun fetchIncidents(): List<Incident>
}