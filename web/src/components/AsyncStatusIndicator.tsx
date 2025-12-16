import { useAsyncStore } from '@/lib/asyncStore';
import { Bot, Search, Brain, Zap, CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AsyncStatusIndicator() {
  const { currentRequest, retrievalProgress } = useAsyncStore();

  if (!currentRequest || currentRequest.phase === 'idle') {
    return null;
  }

  const getStatusConfig = () => {
    switch (currentRequest.phase) {
      case 'queued':
        return {
          icon: Clock,
          text: 'AI đã nhận yêu cầu...',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'retrieving':
        return {
          icon: Search,
          text: `Đang tìm kiếm... ${retrievalProgress ? `${retrievalProgress.documentsFound}/${retrievalProgress.totalDocuments}` : ''}`,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        };
      case 'processing':
        return {
          icon: Brain,
          text: 'Đang phân tích kết quả...',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200'
        };
      case 'streaming':
        return {
          icon: Zap,
          text: 'Đang tạo câu trả lời...',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'completed':
        return {
          icon: CheckCircle,
          text: 'Hoàn thành',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'error':
        return {
          icon: XCircle,
          text: currentRequest.error || 'Có lỗi xảy ra',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl border",
      config.bgColor,
      config.borderColor
    )}>
      <Icon className={cn("w-5 h-5", config.color)} />
      <span className={cn("text-sm font-medium", config.color)}>
        {config.text}
      </span>
      {retrievalProgress && currentRequest.phase === 'retrieving' && (
        <div className="ml-auto flex items-center gap-2">
          <div className="w-16 h-2 bg-current/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-current rounded-full transition-all duration-300"
              style={{ width: `${(retrievalProgress.documentsFound / retrievalProgress.totalDocuments) * 100}%` }}
            />
          </div>
          <span className="text-xs text-current/70">
            {Math.round((retrievalProgress.documentsFound / retrievalProgress.totalDocuments) * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}
