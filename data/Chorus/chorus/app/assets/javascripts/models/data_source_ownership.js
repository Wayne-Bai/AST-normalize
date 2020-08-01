chorus.models.DataSourceOwnership = chorus.models.Base.extend({
    constructorName: "DataSourceOwnership",
    urlTemplate: "data_sources/{{dataSourceId}}/owner",
    parameterWrapper: "owner"
});