class ReportIncidentUseCase(private val repository: IncidentRepository) {
    suspend fun execute(incident: Incident) = repository.reportIncident(incident)
}