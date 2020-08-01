chorus.models.JobResult = chorus.models.Base.extend({
    constructorName: 'JobResult',
    urlTemplate: "jobs/{{jobId}}/job_results/{{id}}",
    showUrlTemplate: "jobs/{{jobId}}/job_results/{{id}}"
});