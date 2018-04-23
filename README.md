# fh-mbaas-service (DEPRECATED)
[![Dependency Status](https://img.shields.io/david/feedhenry-templates/fh-mbaas-service.svg?style=flat-square)](https://david-dm.org/feedhenry-templates/fh-mbaas-service)

Feedhenry service to support deployed Apps in an MBaaS e.g. OpenShift

This service supports Forms functionality for applications running on OpenShift v2 MBaaS type.
# Build

```
npm install
```

# Tests

All the tests are in the "test/" directory. The cloud app is using mocha as the test runner. 

To run:
* unit the tests:
```
npm test
```
* coverage report for unit tests:
```
npm run coverage
```

# Deprecation
The support for the 2.X, V2, OpenShift version is not so long supported by RHMAP. The current version supported is 3.X, V3. 
