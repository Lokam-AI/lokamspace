// client/src/pages/Agents/Samba/SambaPage.tsx
import React, { useState } from 'react';
import AgentTaskSidebar from '../../../components/AgentTaskSidebar';
import Tabs from '../../../components/Tabs';

const SambaPage: React.FC = () => {
  const [postType, setPostType] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [example1, setExample1] = useState('');
  const [example2, setExample2] = useState('');
  const [resourceLinks, setResourceLinks] = useState([{ url: '', enabled: false }]);
  const [contentTopics, setContentTopics] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSchedulePopup, setShowSchedulePopup] = useState(false);
  const [isAgentFlowEnabled, setIsAgentFlowEnabled] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const availableTopics = ['Marketing Tips', 'Industry Insights', 'Personal Development', 'Product Updates'];

  const tasks = [
    {
      agentName: 'SAMBA',
      title: 'Generating LinkedIn Post',
      description: 'Creating a post for LinkedIn with the latest marketing insights.',
      timeTaken: '2 mins',
      creditsUsed: 5,
    },
    // Add more tasks as needed
  ];

  const handleTrialRun = () => {
    console.log('Quick Run clicked');
    setShowSidebar(true);
  };

  const handleSchedule = () => {
    setShowSchedulePopup(true);
    console.log('Schedule clicked');
  };

  const handleViewHistory = () => {
    setShowHistory(!showHistory);
    console.log('History clicked');
    setShowSidebar(true);
  };

  const closeSchedulePopup = () => {
    setShowSchedulePopup(false);
  };

  const handleResourceLinkChange = (index: number, value: string) => {
    const newLinks = [...resourceLinks];
    newLinks[index].url = value;
    setResourceLinks(newLinks);
  };

  const handleResourceToggle = (index: number) => {
    const newLinks = [...resourceLinks];
    newLinks[index].enabled = !newLinks[index].enabled;
    setResourceLinks(newLinks);
  };

  const addResourceLink = () => {
    setResourceLinks([...resourceLinks, { url: '', enabled: false }]);
  };

  const handleTopicChange = (topic: string) => {
    setContentTopics((prevTopics) =>
      prevTopics.includes(topic)
        ? prevTopics.filter((t) => t !== topic)
        : [...prevTopics, topic]
    );
  };

  const handleToggleAgentFlow = () => {
    setIsAgentFlowEnabled(!isAgentFlowEnabled);
    console.log('Agent Flow toggled:', !isAgentFlowEnabled);
  };

  const handleSaveConfiguration = () => {
    const configuration = {
      postType,
      additionalInfo,
      example1,
      example2,
      resourceLinks,
      contentTopics,
    };
    console.log('Configuration saved:', configuration);
    setShowSidebar(true);
  };

  return (
    <div className="relative p-4 bg-gradient-to-b from-white to-gray-100 shadow-lg rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Existing Card: Project Details */}
        <div className="bg-white shadow-md rounded-lg p-4 col-span-2">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold text-gray-800">SAMBA</h1>
            <div className="flex space-x-2 items-center">
              <button
                className="bg-blue-500 text-white px-4 py-1 rounded-lg hover:bg-blue-600 transition-transform transform hover:scale-105"
                onClick={handleSaveConfiguration}
              >
                Save
              </button>
              <button
                className="bg-indigo-500 text-white px-3 py-1 rounded-lg hover:bg-indigo-600 transition-transform transform hover:scale-105"
                onClick={handleTrialRun}
              >
                Quick Run
              </button>
              <button
                className="bg-gray-500 text-white px-3 py-1 rounded-lg hover:bg-gray-600 transition-transform transform hover:scale-105"
                onClick={handleViewHistory}
              >
                History
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-700 mb-2">
            Automate your LinkedIn posts, generate marketing content, and schedule them effortlessly.
          </p>
          <div className="text-xs text-gray-500 mb-2">
            <p><span className="font-medium">Last Updated:</span> 2023-10-01</p>
            <p><span className="font-medium">Stars:</span> ★★★★☆</p>
            <p><span className="font-medium">Used by:</span> 1,234 users</p>
          </div>
          <div className="flex justify-end items-center mt-4">
            <span className="text-sm text-gray-700 mr-2">Agent Flow</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAgentFlowEnabled}
                onChange={handleToggleAgentFlow}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white shadow-md rounded-lg p-4 col-span-2">
          <Tabs tabs={['Configuration', 'Previous Results', 'Support']}>
            {/* Configuration Tab */}
            <div>
              {/* Configuration content goes here */}
              <h2 className="text-xl font-bold mb-2">Configuration</h2>
              {/* Include existing configuration sections here */}
              <div className="bg-white shadow-md rounded-lg p-4">
                <h2 className="text-xl font-bold mb-2">Brand or Personal Voice Guidelines</h2>
                <div className="mb-2">
                  <label className="block text-sm font-semibold mb-1">Style & Tone</label>
                  <div className="flex space-x-2">
                    <label className="flex items-center">
                      <input type="radio" name="style-tone" value="professional" className="mr-1" />
                      Professional
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="style-tone" value="playful" className="mr-1" />
                      Playful
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="style-tone" value="thought-leader" className="mr-1" />
                      Thought Leader
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="style-tone" value="friendly" className="mr-1" />
                      Friendly
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Brand Elements</label>
                  <input type="file" className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
                </div>
              </div>

              <div className="bg-white shadow-md rounded-lg p-4">
                <h2 className="text-xl font-bold mb-2">General Business / Personal Info</h2>
                <div className="mb-2">
                  <label className="block text-sm font-semibold mb-1">Industry & Niche</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" placeholder="Enter industry or niche" />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-semibold mb-1">Value Proposition / USP</label>
                  <textarea className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" placeholder="What sets you apart?"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Target Audience</label>
                  <textarea className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" placeholder="Describe your target audience"></textarea>
                </div>
              </div>

              <div className="bg-white shadow-md rounded-lg p-4">
                <h2 className="text-xl font-bold mb-2">Content Sources & Links</h2>
                <div className="mb-2">
                  <label className="block text-sm font-semibold mb-1">Website URLs / Articles / Resources</label>
                  {resourceLinks.map((link, index) => (
                    <div key={index} className="flex items-center mb-1">
                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) => handleResourceLinkChange(index, e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        placeholder="Enter URL"
                      />
                      <button
                        className="ml-2 text-red-500 hover:text-red-700"
                        onClick={() => setResourceLinks(resourceLinks.filter((_, i) => i !== index))}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                  {resourceLinks.length < 5 && (
                    <button
                      className="mt-2 bg-gray-300 text-black px-3 py-1 rounded hover:bg-gray-400"
                      onClick={addResourceLink}
                    >
                      Add URL
                    </button>
                  )}
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-semibold mb-1">Preferred Content Topics</label>
                  <div className="flex flex-wrap">
                    {availableTopics.map((topic) => (
                      <label key={topic} className="flex items-center mr-4 mb-2">
                        <input
                          type="checkbox"
                          checked={contentTopics.includes(topic)}
                          onChange={() => handleTopicChange(topic)}
                          className="mr-1"
                        />
                        {topic}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Example Posts</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <textarea
                      value={example1}
                      onChange={(e) => setExample1(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-2 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      placeholder="Example Post 1"
                      rows={6}
                    />
                    <textarea
                      value={example2}
                      onChange={(e) => setExample2(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-2 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      placeholder="Example Post 2"
                      rows={6}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white shadow-md rounded-lg p-4">
                <h2 className="text-xl font-bold mb-2">Post Format & Frequency Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-2">
                    <label className="block text-sm font-semibold mb-1">Post Type</label>
                    <div className="flex flex-wrap space-x-2">
                      <label className="flex items-center">
                        <input type="radio" name="post-type" value="long-term" className="mr-1" />
                        Long Term
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="post-type" value="short-term" className="mr-1" />
                        Short Term
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="post-type" value="daily-snippet" className="mr-1" />
                        Daily Snippet
                      </label>
                    </div>
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm font-semibold mb-1">Use of Media</label>
                    <div className="flex flex-wrap space-x-2">
                      <label className="flex items-center">
                        <input type="radio" name="use-of-media" value="infographics" className="mr-1" />
                        Infographics
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="use-of-media" value="casual-images" className="mr-1" />
                        Casual Images
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="use-of-media" value="diagrams" className="mr-1" />
                        Diagrams
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="use-of-media" value="none" className="mr-1" />
                        None
                      </label>
                    </div>
                  </div>
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-semibold mb-1">Posting Frequency</label>
                  <div className="flex flex-wrap space-x-2">
                    <label className="flex items-center">
                      <input type="radio" name="posting-frequency" value="one-time" className="mr-1" />
                      One Time
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="posting-frequency" value="daily" className="mr-1" />
                      Daily
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="posting-frequency" value="weekly" className="mr-1" />
                      Weekly
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="posting-frequency" value="monthly" className="mr-1" />
                      Monthly
                    </label>
                  </div>
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-semibold mb-1">Scheduler Settings</label>
                  <input type="time" className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Time Zone</label>
                  <select className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition">
                    <option value="UTC">UTC</option>
                    <option value="PST">PST</option>
                    <option value="EST">EST</option>
                    <option value="CST">CST</option>
                    <option value="MST">MST</option>
                    {/* Add more time zones as needed */}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Hashtags & Mentions</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    placeholder="Enter hashtags or mentions"
                    onChange={(e) => {
                      const value = e.target.value;
                      const formattedValue = value
                        .split(' ')
                        .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`))
                        .join(' ');
                      e.target.value = formattedValue;
                    }}
                  ></textarea>
                </div>
              </div>

              <div className="bg-white shadow-md rounded-lg p-4">
                <h2 className="text-xl font-bold mb-2">Approval & Review Workflow</h2>
                <div className="mb-2">
                  <label className="block text-sm font-semibold mb-1">Approval Process</label>
                  <div className="flex space-x-2">
                    <label className="flex items-center">
                      <input type="radio" name="approval-process" value="auto-publish" className="mr-1" />
                      Automatically Publish
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="approval-process" value="email-review" className="mr-1" />
                      Send via Email for Review
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Email for Drafts</label>
                  <input type="email" className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" placeholder="Enter email for drafts" />
                </div>
              </div>
            </div>

            {/* Previous Results Tab */}
            <div>
              <h2 className="text-xl font-bold mb-2">Previous Results</h2>
              {/* Example of previous results cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-100 p-4 rounded-lg shadow-md">
                  <h3 className="font-semibold">Post Title 1</h3>
                  <p className="text-sm">Description of the post...</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg shadow-md">
                  <h3 className="font-semibold">Post Title 2</h3>
                  <p className="text-sm">Description of the post...</p>
                </div>
                {/* Add more cards as needed */}
              </div>
            </div>

            {/* Support Tab */}
            <div>
              <h2 className="text-xl font-bold mb-2">Support</h2>
              {/* Simple chat interface */}
              <div className="bg-gray-100 p-4 rounded-lg shadow-md">
                <div className="mb-2">
                  <p className="text-sm"><strong>User:</strong> How do I configure the agent?</p>
                  <p className="text-sm"><strong>Helper:</strong> You can configure the agent by...</p>
                </div>
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            </div>
          </Tabs>
        </div>
      </div>
      {showSidebar && <AgentTaskSidebar tasks={tasks} onClose={() => setShowSidebar(false)} />}
    </div>
  );
}

export default SambaPage;