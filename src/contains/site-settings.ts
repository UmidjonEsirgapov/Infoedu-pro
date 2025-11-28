// import from file json
import siteSettingsJson from '../../site-settings.json'
import defaultSiteSettingsJson from '../../default-site-settings-do-not-edit-this-file.json'
import _ from 'lodash'

type RecursivePartial<T> = {
	[P in keyof T]?: RecursivePartial<T[P]>
}

type PartialExcept<T, K extends keyof T> = RecursivePartial<T> & Pick<T, K>

/**
 * Recursively replaces [year] placeholder with current year in all string values
 */
function replaceYearInObject(obj: any): any {
	if (typeof obj === 'string') {
		const currentYear = new Date().getFullYear()
		return obj.replace(/\[year\]/g, currentYear.toString())
	}
	if (Array.isArray(obj)) {
		return obj.map(item => replaceYearInObject(item))
	}
	if (obj && typeof obj === 'object') {
		const result: any = {}
		for (const key in obj) {
			if (Object.prototype.hasOwnProperty.call(obj, key)) {
				result[key] = replaceYearInObject(obj[key])
			}
		}
		return result
	}
	return obj
}

const mergedSettings = _.merge({}, defaultSiteSettingsJson, siteSettingsJson)

export const NC_SITE_SETTINGS: RecursivePartial<
	typeof defaultSiteSettingsJson
> = replaceYearInObject(mergedSettings) as RecursivePartial<
	typeof defaultSiteSettingsJson
>

export const IS_CHISNGHIAX_DEMO_SITE =
	process.env.NEXT_PUBLIC_IS_CHISNGHIAX_DEMO_SITE === 'true'
