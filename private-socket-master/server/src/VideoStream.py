class VideoStream:
	def __init__(self, filename):
		self.filename = filename
		try:
			self.file = open(filename, 'rb')
		except:
			raise IOError
		self.frameNum = 0
		self.frameIdx = []
		self.idx = 0
		self.fast_forward = 0
		self.fast_backward = 0
		# while True: 
		# 	data = self.file.read(5)
		# 	if data: 
		# 		framelength = int(data)
		# 		data = self.file.read(framelength)
		# 		self.frameIdx.append(framelength)
		# 	else: 
		# 		break
		# self.file.seek(0, 0)
	

	def get_total_time(self): 
		return 0.04*len(self.frameIdx)

	
	def fastForward(self): 
		self.fast_forward += 1 
	
	def fastBackward(self): 
		self.fast_backward += 1 

	def increaseFrame(self, fastForwardNum):
		previousData = -1 
		for i in range(fastForwardNum): 
			data = self.file.read(5)
			if data: 
				framelength = int(data)
				self.idx += 1
				data = self.file.read(framelength)
				previousData = data
				if(self.idx > len(self.frameIdx)):
					self.frameIdx.append(framelength)
			else: 
				return previousData
		return -1
	

	def decreaseFrame(self, fastBackwardNum): 
		if fastBackwardNum >= self.idx:
			self.file.seek(0, 0)
			self.idx = 0
		
		else: 
			for i in range(fastBackwardNum): 
				self.file.seek(-5-self.frameIdx[self.idx-1], 1)
				self.idx -= 1

	def nextFrame(self):
		"""Get next frame."""
		if self.fast_forward > 0: 
			result = self.increaseFrame(self.fast_forward*5*25)
			self.frameNum = self.idx
			self.fast_forward = 0
			if result != -1:
				return result
		
		if self.fast_backward > 0: 
			self.decreaseFrame(self.fast_backward*5*25)
			self.fast_backward = 0
		self.frameNum = self.idx
		data = self.file.read(5) # Get the framelength from the first 5 bits
		if data: 
			framelength = int(data)			
			# Read the current frame
			self.idx += 1
			data = self.file.read(framelength)
			if(self.idx > len(self.frameIdx)):
				self.frameIdx.append(framelength)
			self.frameNum = self.idx
		# print(framelength
		return data
		
	def frameNbr(self):
		"""Get frame number."""
		return self.frameNum
	def getcurrentframe(self):
		data = self.file.read(5) # Get the framelength from the first 5 bits
		if data: 
			framelength = int(data)			
			# Read the current frame
			# self.idx += 1
			data = self.file.read(framelength)
			# if(self.idx > len(self.frameIdx)):
			# 	self.frameIdx.append(framelength)
			# self.frameNum = self.idx
		# print(framelength
		return data
	
	