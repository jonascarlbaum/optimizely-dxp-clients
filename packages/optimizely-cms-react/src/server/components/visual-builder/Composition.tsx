import 'server-only'
import { createElement, type FunctionComponent } from 'react'
import { isElementNode } from './functions.js'
import { CmsContent } from '../cms-content.js'
import type { ContentType } from '../../../types.js'
import { isContentLink, ContentLinkWithLocale, isInlineContentLink } from '@remkoj/optimizely-graph-client'
import type { OptimizelyCompositionProps, LeafPropsFactory, CompositionElementNode, NodePropsFactory, CompositionStructureNode } from './types.js'
import getServerContext from '../../context.js'

function isContentType(toTest: any) : toTest is ContentType
{
    return Array.isArray(toTest) && toTest.every(x => typeof(x) == 'string' && x.length > 0)
}

const defaultPropsFactory : LeafPropsFactory = <ET extends Record<string, any>, LT = string>(node: CompositionElementNode<ET>) => {
    const contentType = node.element?._metadata?.types
    if (!isContentType(contentType))
        throw new Error("Invalid content type: "+JSON.stringify(contentType))

    const contentLink : Partial<ContentLinkWithLocale<LT>> = {
        key: node.element?._metadata?.key || node.key || undefined,
        version: node.element?._metadata?.version,
        locale: node.element?._metadata?.locale
    }
    if (!(isContentLink(contentLink) || isInlineContentLink(contentLink)))
        throw new Error("Invalid content link: "+JSON.stringify(contentLink))

    const layoutData = {
        type: node.type,
        layoutType: node.layoutType,
        template: node.template,
        settings: node.settings
    }

    return [ contentLink, contentType, node.element, layoutData ]
}

function ucFirst(input: string): string
{
    return input[0].toUpperCase() + input.substring(1)
}

const defaultNodePropsFactory : NodePropsFactory = <ET extends Record<string, any>, LT = string>(node: CompositionStructureNode) => {
    const componentTypes = [
        [ node.template, node.type ? ucFirst(node.type) : null, ucFirst(node.layoutType), "Component", "Content"].filter(x => x) as string[],
        (node.template && node.type) ? [ node.type ? ucFirst(node.type) : null, ucFirst(node.layoutType), "Component", "Content"].filter(x => x) as string[] : null,
        ["Node","Component","Content"]
    ].filter(x => x) as Array<Array<string>>
    const contentLink : ContentLinkWithLocale<LT> = { key: node.key ?? '' }
    const componentData : ET = {} as ET
    const layoutData = {
        type: node.type,
        layoutType: node.layoutType,
        template: node.template,
        settings: node.settings
    }

    if (!(isContentLink(contentLink) || isInlineContentLink(contentLink)))
        throw new Error("Invalid content link: "+JSON.stringify(contentLink))

    return [ contentLink, componentTypes, componentData, layoutData ]
}

/**
 * Render the composition as made available through Optimizely Graph for Visual Builder
 * 
 * @param param0 
 * @returns     The
 */
export async function OptimizelyComposition({ node, leafPropsFactory = defaultPropsFactory, nodePropsFactory = defaultNodePropsFactory}: OptimizelyCompositionProps) : Promise<JSX.Element>
{
    if (isElementNode(node)) {
        const [ contentLink, contentType, fragmentData, layoutProps ] = leafPropsFactory(node)
        //@ts-expect-error CmsContent is an Asynchronous server component, which isn't supported by the generic React Typings
        return <CmsContent contentLink={ contentLink } contentType={ contentType } fragmentData={ fragmentData } layoutProps={ layoutProps } />
    }

    const { factory, isDebug } = getServerContext()
    if (!factory)
        throw new Error("🟡 [VisualBuilder] [OptimizelyComposition] The factory must be defined within the serverContext")

    const [ contentLink, contentTypes, fragmentData, layoutProps ] = nodePropsFactory(node)
    const firstExistingType = contentTypes.map(ct => {
        const reversed = [...ct].reverse()
        const hasType = factory.has(reversed)
        if (!hasType && isDebug)
            console.log(`🟡 [VisualBuilder] [OptimizelyComposition] Content type ${ reversed.join('/') } not found within factory`)
        return hasType
    }).indexOf(true)
    const contentType = contentTypes[firstExistingType]
    if (!contentType)
        throw new Error("🟡 [VisualBuilder] [OptimizelyComposition] The factory must have a definition for Component/Node")

    //@ts-expect-error CmsContent is an Asynchronous server component, which isn't supported by the generic React Typings
    return <CmsContent contentType={contentType} contentLink={contentLink} fragmentData={fragmentData} layoutProps={layoutProps} >
        {(node.nodes ?? []).map((child) => {
            const childKey = child.key ? child.key : `vb::${ JSON.stringify( child )}`
            if (isDebug)
                console.log(`⚪ [VisualBuilder] Generated child key: ${ childKey }`)
            //@ts-expect-error OptimizelyComposition is an Asynchronous server component, which isn't supported by the generic React Typings
            return <OptimizelyComposition key={ childKey } node={ child } leafPropsFactory={ leafPropsFactory } nodePropsFactory={ nodePropsFactory } />
        })}
    </CmsContent>
}

export default OptimizelyComposition