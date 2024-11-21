import { BskyAgent } from '@atproto/api';

const agent = new BskyAgent({
  service: 'https://bsky.social'
});

const formatIdentifier = (identifier) => {
  identifier = identifier.replace('@', '');
  if (!identifier.includes('.') && !identifier.includes('@')) {
    identifier = `${identifier}.bsky.social`;
  }
  return identifier;
};

export const loginWithBluesky = async (identifier, password) => {
  try {
    const formattedIdentifier = formatIdentifier(identifier);
    console.log('Attempting login with:', formattedIdentifier);
    
    const response = await agent.login({
      identifier: formattedIdentifier,
      password: password
    });

    console.log('Raw login response:', response);

    if (response && response.success !== false) {
      const session = {
        did: response.data.did,
        handle: response.data.handle,
        email: response.data.email,
        accessJwt: response.data.accessJwt,
        refreshJwt: response.data.refreshJwt
      };

      agent.session = session;

      return {
        success: true,
        data: session
      };
    }

    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Login error:', error);
    
    let errorMessage = 'Login failed';
    
    if (error.status === 401) {
      errorMessage = 'Invalid username or password';
    } else if (error.status === 429) {
      errorMessage = 'Too many attempts, please try again later';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

export const getTimeline = async () => {
  try {
    if (!agent.session) {
      throw new Error('Not authenticated');
    }

    const feed = await agent.getTimeline({
      limit: 50
    });

    console.log('Timeline response:', feed);

    return {
      success: true,
      data: feed.data.feed.map(item => ({
        uri: item.post.uri,
        cid: item.post.cid,
        author: {
          did: item.post.author.did,
          handle: item.post.author.handle,
          displayName: item.post.author.displayName || item.post.author.handle,
          avatar: item.post.author.avatar
        },
        record: {
          text: item.post.record.text,
          createdAt: item.post.record.createdAt
        },
        embed: item.post.embed,
        replyCount: item.post.replyCount || 0,
        repostCount: item.post.repostCount || 0,
        likeCount: item.post.likeCount || 0,
        indexedAt: item.post.indexedAt
      }))
    };
  } catch (error) {
    console.error('Timeline error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const createPost = async (text) => {
  try {
    if (!agent.session) {
      throw new Error('Not authenticated');
    }

    const response = await agent.post({
      text: text,
      createdAt: new Date().toISOString()
    });

    return {
      success: true,
      data: response
    };
  } catch (error) {
    console.error('Post creation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const replyToPost = async (text, parentPost) => {
  try {
    if (!agent.session) {
      throw new Error('Not authenticated');
    }

    const response = await agent.post({
      text: text,
      reply: {
        root: { uri: parentPost.uri, cid: parentPost.cid },
        parent: { uri: parentPost.uri, cid: parentPost.cid }
      },
      createdAt: new Date().toISOString()
    });

    return {
      success: true,
      data: response
    };
  } catch (error) {
    console.error('Reply error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const searchPosts = async (query) => {
  try {
    if (!agent.session) {
      throw new Error('Not authenticated');
    }

    const actorResults = await agent.searchActors({
      term: query,
      limit: 10
    });

    const timelineResponse = await agent.getTimeline();
    const allPosts = timelineResponse.data.feed;

    const filteredPosts = allPosts.filter(item => 
      item.post.record.text.toLowerCase().includes(query.toLowerCase()) ||
      (item.post.author.handle.toLowerCase().includes(query.toLowerCase())) ||
      (item.post.author.displayName?.toLowerCase().includes(query.toLowerCase()))
    ).map(item => ({
      uri: item.post.uri,
      cid: item.post.cid,
      author: {
        did: item.post.author.did,
        handle: item.post.author.handle,
        displayName: item.post.author.displayName || item.post.author.handle,
        avatar: item.post.author.avatar
      },
      record: {
        text: item.post.record.text,
        createdAt: item.post.record.createdAt
      },
      embed: item.post.embed,
      replyCount: item.post.replyCount || 0,
      repostCount: item.post.repostCount || 0,
      likeCount: item.post.likeCount || 0,
      indexedAt: item.post.indexedAt
    }));

    return {
      success: true,
      data: {
        posts: filteredPosts,
        actors: actorResults.data.actors.map(actor => ({
          did: actor.did,
          handle: actor.handle,
          displayName: actor.displayName || actor.handle,
          avatar: actor.avatar
        }))
      }
    };
  } catch (error) {
    console.error('Search error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const searchUsers = async (term) => {
  try {
    if (!agent.session) {
      throw new Error('Not authenticated');
    }

    const response = await agent.searchActors({
      term,
      limit: 10
    });

    return {
      success: true,
      data: response.data.actors.map(actor => ({
        did: actor.did,
        handle: actor.handle,
        displayName: actor.displayName || actor.handle,
        avatar: actor.avatar
      }))
    };
  } catch (error) {
    console.error('Search error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const getProfile = async (actor) => {
  try {
    if (!agent.session) {
      throw new Error('Not authenticated');
    }

    const response = await agent.getProfile({ actor });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Profile error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const followUser = async (did) => {
  try {
    if (!agent.session) {
      throw new Error('Not authenticated');
    }

    const response = await agent.follow(did);
    return {
      success: true,
      data: response
    };
  } catch (error) {
    console.error('Follow error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const likePost = async (uri, cid) => {
  try {
    if (!agent.session) {
      throw new Error('Not authenticated');
    }

    const response = await agent.like(uri, cid);
    return {
      success: true,
      data: response
    };
  } catch (error) {
    console.error('Like error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const repostPost = async (uri, cid) => {
  try {
    if (!agent.session) {
      throw new Error('Not authenticated');
    }

    const response = await agent.repost(uri, cid);
    return {
      success: true,
      data: response
    };
  } catch (error) {
    console.error('Repost error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const deletePost = async (uri) => {
  try {
    if (!agent.session) {
      throw new Error('Not authenticated');
    }

    const response = await agent.deletePost(uri);
    return {
      success: true,
      data: response
    };
  } catch (error) {
    console.error('Delete post error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const getPostThread = async (uri) => {
  try {
    if (!agent.session) {
      throw new Error('Not authenticated');
    }

    const response = await agent.getPostThread({ uri });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Get thread error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const getAgent = () => agent;
