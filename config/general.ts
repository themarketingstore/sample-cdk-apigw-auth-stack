const stackConfig =  {
    // Stack timezone
    stack_timezone: process.env.STACK_TIMEZONE ?? "America/Chicago",
    // Default tags to add to created resources
    tags: {
        ClientName: "tmsw",
        Application: "CDK Auth Sample",
        CreatedBy: "CDK",
    }
}

export default stackConfig;