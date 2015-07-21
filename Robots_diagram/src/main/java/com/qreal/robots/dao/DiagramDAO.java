package com.qreal.robots.dao;

import com.qreal.robots.model.diagram.Diagram;
import com.qreal.robots.model.diagram.DiagramRequest;
import com.qreal.robots.model.diagram.Folder;

import java.util.List;

/**
 * Created by vladzx on 22.06.15.
 */
public interface DiagramDAO {

    public boolean save(Diagram diagram);

    public Diagram openDiagram(DiagramRequest request);

    public String rewriteDiagram(Diagram diagram);

    public boolean createFolder(Folder folder);

    public List<String> getFolderNames(String currentFolderId);

    public List<String> getDiagramNames(String folderId);
}
