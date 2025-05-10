interface IncidentApiService {
    @POST("/incidents")
    suspend fun postIncident(@Body incidentDto: IncidentDto)

    @GET("/incidents")
    suspend fun getIncidents(): List<IncidentDto>
}