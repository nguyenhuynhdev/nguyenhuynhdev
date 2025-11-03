// Mock data fallback when database has no records
// Store mock JSON files in /data/dump/*.json

export async function loadMockData(entity: string): Promise<any> {
  try {
    // In Cloudflare Pages Functions, we can't use fs
    // So we'll return hardcoded mock data or fetch from external URL
    // For now, return empty array or default structure
    
    const mockData: Record<string, any> = {
      blogs: {
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      },
      projects: {
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      },
      users: {
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      },
      media: {
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      },
      categories: {
        data: [
          { id: 1, name: 'Technology', slug: 'technology', description: 'Tech articles' },
          { id: 2, name: 'Design', slug: 'design', description: 'Design articles' },
        ],
      },
      tags: {
        data: [
          { id: 1, name: 'Next.js', slug: 'nextjs' },
          { id: 2, name: 'React', slug: 'react' },
          { id: 3, name: 'TypeScript', slug: 'typescript' },
        ],
      },
      settings: {
        data: {
          site_name: 'My Website',
          site_description: 'A modern website',
          site_url: 'https://example.com',
        },
      },
      notifications: {
        data: [],
      },
    };

    return mockData[entity] || { data: [] };
  } catch (error) {
    console.error(`Error loading mock data for ${entity}:`, error);
    return { data: [] };
  }
}

export function shouldUseMockData(result: any): boolean {
  // Check if database result is empty
  if (!result || !result.results || result.results.length === 0) {
    return true;
  }
  return false;
}

