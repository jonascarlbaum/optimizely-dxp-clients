import { gql } from "graphql-request";
export const query = gql `query GetRouteByPath($path: String!, $domain: String) {
    _Content(
        where: { _metadata: { url: { default: { eq: $path }, base: { eq: $domain } } } }
    ) {
        total
        items {
            _metadata {
                key
                version
                locale
                displayName
                types
                url {
                    path: default
                    domain: base
                }
                ... on IInstanceMetadata {
                    slug: routeSegment
                }
                ... on IMediaMetadata {
                    slug: routeSegment
                }
            }
            changed: _modified
        }
    }
}`;
//# sourceMappingURL=getRouteByPath.js.map