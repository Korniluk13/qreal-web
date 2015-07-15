package com.qreal.robots.dao;

import com.qreal.robots.model.diagram.Diagram;
import com.qreal.robots.model.diagram.DiagramRequest;
import com.qreal.robots.model.diagram.Folder;

import java.util.List;

/**
 * Created by vladzx on 22.06.15.
 */
public interface DiagramDAO {

    public String save(Diagram diagram);

    public Diagram openDiagram(DiagramRequest request);

    public String createFolder(Folder folder);

    public List<String> showFoldersByUserName(String currentFolderId);

    public String getParentFolder(String currentFolderId);

    public List<String> showDiagramNames(String folderId);
}
