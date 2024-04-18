import type { Types } from '@graphql-codegen/plugin-helpers'

type DocumentsConfigNode = NonNullable<Types.Config['documents']>

export const IContentDataProps = ["contentType","id","locale","path","__typename"]

export const fragments = [
`fragment IContentData on IContent
{
    _metadata {
        ...IContentInfo
    }
    _type: __typename
}`,
`fragment CompositionData on ICompositionNode {
    name
    type
    ... on ICompositionStructureNode {
        nodes @recursive(depth: 5) {
            name
        }
    }
    ... on ICompositionElementNode {
        element {
            ...ElementData
        }
    }
}`,
`fragment IElementData on IElement {
    _metadata {
        ...IContentInfo
    }
    _type: __typename
}`,
`fragment ElementData on IElement {
    ...IElementData
}`,
`fragment BlockData on IContent {
    ...IContentData
}`,
`fragment PageData on IContent {
    ...IContentData
}`,
`fragment LinkData on ContentUrl {
    base
    hierarchical
    default
}`,
`fragment ReferenceData on ContentReference {
    key
    locale
    url {
        ...LinkData
    }
}`,
`fragment IContentInfo on IContentMetadata {
    key
    locale
    types
    displayName
    version
    url {
        ...LinkData
    }
}`,
`fragment IContentListItem on IContent {
    ...IContentData
}`
  /*
    `fragment ContentLink on ContentModelReference {
      id: Id,
      workId: WorkId,
      guidValue: GuidValue
    }`,
    `fragment ContentLinkSearch on ContentModelReferenceSearch {
      id: Id,
      workId: WorkId,
      guidValue: GuidValue
    }`,
    `fragment IContentData on IContent {
        contentType: ContentType
        id: ContentLink {
          ...ContentLink
        }
        locale: Language {
            name: Name
        }
        path:RelativePath
    }`,
    `fragment ContentAreaItemData on ContentAreaItemModelSearch {
        item: ContentLink {
            ...ContentLinkSearch
            data: Expanded {
            ...BlockData
            }
        }
        displayOption:DisplayOption
    }`,
    `fragment BlockContentAreaItemSearchData on ContentAreaItemModelSearch {
        item: ContentLink {
            ...ContentLinkSearch
            data: Expanded {
            ...IContentData
            }
        }
        displayOption:DisplayOption
    }`,
    `fragment BlockContentAreaItemData on ContentAreaItemModel {
        item: ContentLink {
            ...ContentLink
            data: Expanded {
            ...IContentData
            }
        }
        displayOption:DisplayOption
    }`,
    `fragment LinkItemData on LinkItemNode {
      children: Text
      title: Title
      href: Href
      target: Target
      content: ContentLink {
        href: Url
        data: Expanded {
          path: RelativePath
        }
      }
    }`,
    `fragment ImageData on ContentModelReference {
      ...ContentLink
      url: Url
      data: Expanded {
        ...IContentData
        url: Url
        alt: Name 
        path: RelativePath
      }
    }`,
    `fragment ImageDataSearch on ContentModelReferenceSearch {
      ...ContentLinkSearch
      url: Url
      data: Expanded {
        ...IContentData
        url: Url
        alt: Name 
        path: RelativePath
      }
    }`,
    `fragment BlockData on IContent {
        ...IContentData
    }`,
    `fragment PageData on IContent {
        ...IContentData
    }`,
    `fragment ContentAreaItemBase on ContentAreaItemModelSearch {
        contentLink:ContentLink { 
            id:Id
            workId:WorkId
            guidValue:GuidValue
            component:Expanded {
                path:RelativePath
                type:ContentType
            }
        }
        displayOption:DisplayOption
    }`*/
]
export const queries = [
`query getContentById($key: String!, $version: String, $locale: [Locales!], $path: String, $domain: String) {
    content: Content(
        where: {
            _or: [
                { _metadata: { key: { eq: $key }, version: { eq: $version } } }
                { _metadata: { url: { hierarchical: { eq: $path }, base: { eq: $domain } }, version: { eq: $version } } }
            ]
        }
        locale: $locale
    ) {
        total
        items {
            ...IContentData
            ...BlockData
            ...PageData
        }
    }
}`,
`query getContentByPath($key: String, $version: String, $locale: [Locales!], $path: String!, $domain: String) {
    content: Content(
        where: {
            _or: [
                { _metadata: { key: { eq: $key }, version: { eq: $version } } }
                { _metadata: { url: { hierarchical: { eq: $path }, base: { eq: $domain } }, version: { eq: $version } } }
            ]
        }
        locale: $locale
    ) {
        total
        items {
            ...IContentData
            ...BlockData
            ...PageData
        }
    }
}`,
`query getContentType($key: String!, $version: String, $locale: [Locales!], $path: String, $domain: String) {
    content: Content(
        where: {
            _or: [
                { _metadata: { key: { eq: $key }, version: { eq: $version } } }
                { _metadata: { url: { hierarchical: { eq: $path }, base: { eq: $domain } }, version: { eq: $version } } }
            ]
        }
        locale: $locale
    ) {
        total
        items {
            _metadata {
                types
            }
        }
    }
}`
]

export const DefaultFunctions = ['getContentType','getContentByPath','getContentById']
export const documents = [ ...queries, ...fragments ]
export const injectFragments : (base: DocumentsConfigNode) => DocumentsConfigNode = (base) =>
{
    const baseIsArray = Array.isArray(base)
    return baseIsArray ? [ ...fragments, ...base ] : [ ...fragments, base ]
}