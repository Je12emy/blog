import rss from '@astrojs/rss';
import { SITE_TITLE, SITE_DESCRIPTION, SITE } from '../config';
import { getCollection } from "astro:content";
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';
const parser = new MarkdownIt();

export const get = async () => {
	const blog = await getCollection('blog');
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: SITE,
		items: blog.map((post) => ({
			title: post.data.title,
			pubDate: post.data.pubDate,
			description: post.data.description,
			link: `/blog/${post.slug}/`,
			content: sanitizeHtml(parser.render(post.body)),
		})),
	})
}
